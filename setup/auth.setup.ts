import { test as setup } from '@playwright/test';
import { disableInstructorHints, loginWithBrowser } from './vention-login';

// The API login works, but it [may] depends on server-action ids that change
// when the login page is deployed. The browser login works every time. To be verified.
setup('log in through the browser', async ({ page }) => {
  await loginWithBrowser(page);
  await disableInstructorHints(page.request);
});
