# platform-qa

Playwright tests for the Vention platform.

## Getting started

Node 24.22.1 and pnpm 11.15.0, as set in `package.json`.

Run `pnpm install --frozen-lockfile`, then `pnpm exec playwright install`.

Copy `.env.local.example` to `.env.local` and set:

- `VENTION_URL`
- `VENTION_EMAIL`
- `VENTION_PASSWORD`
- `VENTION_LOCALE` (`en-CA` or `fr-CA`). The code default is `en-CA` when the variable is unset. `.env.local.example` sets `fr-CA`.

Do not commit `.env.local`, `.auth/`, or `.playwright-cli/`. Those files can hold credentials or session cookies.

`pnpm test` runs the suite.

## Test sequence

The suite runs in this order: health, then setup, then API, then UI.

- Health calls `GET /api/health` and expects `{ "status": "ok" }`. The setup project depends on health.
- Setup signs in and saves the session. `pnpm test`, `pnpm api`, and the browser commands run health first. `pnpm setup` passes `--no-deps`, so it signs in without running health.
- API tests depend on setup. The health spec stays in the `health` project, so the API project does not run it again.
- UI tests are Chromium and WebKit. They depend on the API tests, so health, setup, and API run first. `VENTION_LOCALE` selects `en-CA` or `fr-CA` and defaults to `en-CA` when it is unset.

## Commands

- `pnpm test` runs the suite. Health runs first.
- `pnpm health` runs the health check only.
- `pnpm setup` signs in only.
- `pnpm api` runs the API tests and their dependencies.
- `pnpm ui` opens the Playwright UI for these projects. Running a browser project there still runs health, setup, and API first.
- `pnpm chromium:en` runs Chromium in Canada English, after health, setup, and API. `pnpm chromium:fr` runs it in Canada French.
- `pnpm webkit:en` runs WebKit in Canada English, after health, setup, and API. `pnpm webkit:fr` runs it in Canada French.
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
- `docs/` holds the PRD, the notes, the challenge PDF, and the slide decks.

## Code style

TypeScript uses ES modules. Prettier uses single quotes. ESLint uses the recommended JavaScript rules and the recommended type-checked TypeScript rules, with Prettier last so format rules stay off.

## Roadblocks and issues

I could not create an account with my personal email. An option would be to use a test user.

Machine Builder had race conditions during automation. I tracked them down by running the tests in the Playwright UI (`pnpm ui`).

## How AI was used

The work was done in Cursor, with more than one model.

AI drafted the PRD from my explorations. It then followed that PRD with spec-driven development and fixed bugs with `playwright-cli`. It did some technical research, and it built the three slide decks from my notes.

I wrote about 80% of `docs/notes-and-questions.md`. I set the architecture described in the PRD. I debugged by hand (and I also debugged with `playwright-cli`).
