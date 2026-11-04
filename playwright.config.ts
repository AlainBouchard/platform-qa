import os from 'node:os';
import { defineConfig, devices } from '@playwright/test';
import { siteUrl } from './helpers/site-url';
import { authFile } from './setup/vention-login';

const localeIds = ['en-CA', 'fr-CA'] as const;

type LocaleId = (typeof localeIds)[number];

const locale = localeFromEnv();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? '80%' : '100%',
  reporter: [
    ['list'],
    [
      'allure-playwright',
      {
        resultsDir: 'allure-results',
        environmentInfo: {
          os_platform: os.platform(),
          os_release: os.release(),
          node_version: process.version,
          locale,
        },
      },
    ],
  ],
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: siteUrl(),
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  /* Health runs first. Setup signs in once. Other API tests run next,
     then the UI browser projects. */
  projects: [
    {
      name: 'health',
      testDir: './tests/api',
      testMatch: /health\.spec\.ts/,
    },
    {
      name: 'setup',
      testDir: './setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['health'],
    },
    {
      name: 'api',
      testDir: './tests/api',
      testIgnore: /health\.spec\.ts/,
      use: { storageState: authFile },
      dependencies: ['setup'],
    },
    // Note: we could add Firefox, Edge, etc. here but it's out of scope for this project.
    {
      name: 'chromium',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Chrome'],
        locale,
        storageState: authFile,
        viewport: { width: 1280, height: 720 },
      },
      dependencies: ['api'],
    },
    {
      name: 'webkit',
      testDir: './tests/ui',
      use: {
        ...devices['Desktop Safari'],
        locale,
        storageState: authFile,
        viewport: { width: 1280, height: 720 },
      },
      dependencies: ['api'],
    },
  ],
});

function localeFromEnv(): LocaleId {
  const value = process.env.VENTION_LOCALE ?? 'en-CA';
  if ((localeIds as readonly string[]).includes(value))
    return value as LocaleId;
  throw new Error(
    `VENTION_LOCALE must be ${localeIds.join(' or ')}. Received ${value}.`,
  );
}
