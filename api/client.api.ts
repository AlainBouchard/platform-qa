import type { APIRequestContext, APIResponse } from '@playwright/test';
import { siteUrl } from '../helpers/site-url';

export function siteOrigin(): string {
  return siteUrl();
}

export async function graphql<T>(
  request: APIRequestContext,
  query: string,
  variables: Record<string, unknown>,
): Promise<T> {
  const response = await request.post(graphqlUrl(), {
    headers: {
      Accept: 'application/json',
      Origin: siteOrigin(),
      Referer: new URL('/dashboard', siteOrigin()).href,
    },
    data: { query, variables },
  });
  return readGraphql<T>(response);
}

export async function csrfToken(request: APIRequestContext): Promise<string> {
  const response = await request.get(new URL('/contact', siteOrigin()).href);
  const html = await response.text();
  const token = html.match(/name="csrf-token" content="([^"]+)"/)?.[1];
  if (!token) throw new Error('Vention did not return a CSRF token');
  return token;
}

function graphqlUrl(): string {
  return new URL('/graphql', siteOrigin()).href;
}

async function readGraphql<T>(response: APIResponse): Promise<T> {
  if (!response.ok()) {
    throw new Error(
      `GraphQL request failed: ${response.status()} ${await response.text()}`,
    );
  }

  const body = (await response.json()) as {
    data?: T;
    errors?: { message?: string }[];
  };
  if (body.errors?.length) {
    throw new Error(
      body.errors
        .map((error) => error.message ?? 'Unknown GraphQL error')
        .join(', '),
    );
  }
  if (!body.data) throw new Error('GraphQL response had no data');
  return body.data;
}
