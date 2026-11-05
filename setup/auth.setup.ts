import { test as setup } from '@playwright/test';
import { disableInstructorHints, loginWithBrowser } from './vention-login';

setup(
  'browser sign-in saves a session and turns instructor hints off',
  async ({ page }) => {
    await loginWithBrowser(page);
    await disableInstructorHints(page.request);
  },
);
