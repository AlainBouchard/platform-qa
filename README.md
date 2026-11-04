# platform-qa

Playwright tests for the Vention platform.

## Test sequence

The suite runs in this order: health, then setup, then API, then UI.

- Health calls `GET /api/health` and expects `{ "status": "ok" }`. Setup depends on it, so every project after health runs that check first.
- Setup signs in and saves the session.
- API tests depend on setup. The health spec stays in the `health` project, so the API project does not run it again.
- UI tests are Chromium and WebKit. They depend on the API tests, so health, setup, and API run first. `VENTION_LOCALE` selects `en-CA` or `fr-CA` and defaults to `en-CA`.

## Requirements

Node 24 and pnpm 11, as set in `package.json`.

## Setup

Put these variables in `.env.local`; make a copy from `.env.local.example`:

- `VENTION_URL`
- `VENTION_EMAIL`
- `VENTION_PASSWORD`
- `VENTION_LOCALE` (`en-CA` or `fr-CA`, default `en-CA`)

Do not commit `.env.local`, `.auth/`, or `.playwright-cli/`. Those files can hold credentials or session cookies.

## Commands

- `pnpm test` runs the suite. Health runs first.
- `pnpm health` runs the health check only.
- `pnpm setup` signs in only.
- `pnpm api` runs the API tests and their dependencies.
- `pnpm ui` opens the Playwright UI. The projects there still run setup, then API, then Chromium and WebKit.
- `pnpm chromium:en` runs Chromium in Canada English. `pnpm chromium:fr` runs it in Canada French.
- `pnpm webkit:en` runs WebKit in Canada English. `pnpm webkit:fr` runs it in Canada French.
- `pnpm lint` runs ESLint.
- `pnpm format` runs Prettier.
- `pnpm allure:report` builds `allure-report` from `allure-results`.
- `pnpm allure:open` opens that report in a browser.

Playwright writes `allure-results` on every run. New runs add files to that folder, so delete it when the report should cover one run only. CI uploads `allure-report`, publishes that run to GitHub Pages, and posts a summary on pull requests. The summary links to the page. See [Allure Report](https://allurereport.org/).

## Layout

- `setup/` signs in once and saves the session.
- `api/client.api.ts` is the shared HTTP client. `api/machine-builder.api.ts` holds the Machine Builder operations the tests call.
- `fixtures/design.fixture.ts` creates a design and deletes it on teardown. `fixtures/machine-builder.fixture.ts` opens Machine Builder for that design.
- `pages/` holds page objects the UI tests use.
- `tests/api/` holds API tests. `tests/ui/` holds browser tests.
- `docs/` holds reference data, such as `docs/price.json`.

## Code style

TypeScript uses ES modules. Prettier uses single quotes. ESLint uses the recommended JavaScript and TypeScript rules, with Prettier last so format rules stay off.
