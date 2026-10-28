import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type { APIRequestContext, Page } from '@playwright/test';
import { csrfToken } from '../api/client.api';
import { requiredEnv, siteUrl } from '../helpers/site-url';

export const authFile = '.auth/user.json';

const ssoNotice =
  'Your organization has Single Sign-On enabled. You will be redirected to your identity provider.';
const verificationNotice =
  'Enter the verification code sent to your phone number:';

export async function loginWithBrowser(page: Page): Promise<void> {
  const email = requiredEnv('VENTION_EMAIL');
  const password = requiredEnv('VENTION_PASSWORD');

  await page.goto(new URL('/login', siteUrl()).href);
  await dismissCookies(page);
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('button', { name: 'Next' }).click();

  const passwordField = page.getByLabel('Password');
  const sso = page.getByText(ssoNotice);
  const reachedPassword = await passwordField
    .waitFor({ state: 'visible', timeout: 15_000 })
    .then(() => true)
    .catch(() => false);
  if (!reachedPassword) {
    const sentToSso =
      (await sso.isVisible().catch(() => false)) || !onVentionLogin(page);
    if (sentToSso) {
      throw new Error(
        'This organization requires SSO, so password login was not called.',
      );
    }
    throw new Error(
      'No Vention organization was found for this email, so password login was not called.',
    );
  }

  await passwordField.fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();

  const verification = page.getByText(verificationNotice);
  const finished = await page
    .waitForFunction(
      (notice) => {
        const url = new URL(location.href);
        const onLogin =
          url.hostname.endsWith('vention.com') &&
          url.pathname.startsWith('/login');
        return !onLogin || document.body.innerText.includes(notice);
      },
      verificationNotice,
      { timeout: 20_000 },
    )
    .then(() => true)
    .catch(() => false);
  if (await verification.isVisible().catch(() => false)) {
    throw new Error(
      'This account requires a verification code, so API login cannot finish the session.',
    );
  }
  if (!finished || onVentionLogin(page)) {
    throw new Error('Password login did not return a member session.');
  }

  mkdirSync(dirname(authFile), { recursive: true });
  const state = await page.context().storageState({ path: authFile });
  if (state.cookies.length === 0) {
    throw new Error('Login completed without setting any cookies.');
  }
}

export async function disableInstructorHints(
  request: APIRequestContext,
): Promise<void> {
  const url = new URL('/user/assembler_preferences', siteUrl()).href;
  const current = await request.get(url, {
    headers: { Accept: 'application/json' },
  });
  if (!current.ok()) {
    throw new Error(
      `Could not read assembler preferences (${current.status()})`,
    );
  }
  const preferences = (await current.json()) as Record<string, unknown>;
  if (preferences.showInstructor === false) return;

  const saved = await request.post(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRF-Token': await csrfToken(request),
    },
    data: { preferences: { ...preferences, showInstructor: false } },
  });
  if (!saved.ok()) {
    throw new Error(`Could not turn off instructor hints (${saved.status()})`);
  }
}

async function dismissCookies(page: Page): Promise<void> {
  const cookies = page.locator('#CybotCookiebotDialog');
  if (await cookies.isVisible({ timeout: 8000 }).catch(() => false)) {
    await page.locator('#CybotCookiebotDialogBodyButtonDecline').click();
    await cookies.waitFor({ state: 'hidden' });
  }
}

function onVentionLogin(page: Page): boolean {
  return onVentionLoginUrl(new URL(page.url()));
}

function onVentionLoginUrl(url: URL): boolean {
  return (
    url.hostname.endsWith('vention.com') && url.pathname.startsWith('/login')
  );
}
