import type { APIResponse, Response } from '@playwright/test';

// toBeOK accepts an APIResponse. A page Response from waitForResponse is adapted here.
export function asApiResponse(response: Response): APIResponse {
  return {
    _apiName: 'APIResponse',
    ok: () => response.ok(),
    headers: () => response.headers(),
    text: () => response.text(),
    status: () => response.status(),
    statusText: () => response.statusText(),
    url: () => response.url(),
    _fetchLog() {
      return Promise.resolve(`${response.status()} ${response.url()}`);
    },
  } as unknown as APIResponse;
}
