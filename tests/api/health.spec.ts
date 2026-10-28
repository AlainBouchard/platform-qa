import { expect, test } from '@playwright/test';

test('health is ok', async ({ request }) => {
  const response = await request.get('/api/health');

  await expect(response).toBeOK();
  await expect(response.json()).resolves.toEqual({ status: 'ok' });
});
