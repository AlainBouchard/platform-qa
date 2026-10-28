import type { Page } from '@playwright/test';

const partInsertionProgress = 'mb-progress-bar-part-insertion';

export async function waitForPartInsertionProgress(
  page: Page,
  timeout = 20_000,
): Promise<void> {
  const loader = page.getByTestId(partInsertionProgress);
  // Another copy of a part that is already loaded does not show this bar.
  const appeared = await loader
    .waitFor({ state: 'visible', timeout: 5_000 })
    .then(() => true)
    .catch((error: unknown) => {
      if (error instanceof Error && error.name === 'TimeoutError') return false;
      throw error;
    });
  if (!appeared) return;
  await loader.waitFor({ state: 'hidden', timeout });
}
