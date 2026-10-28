AGENTS.md and other documentation files should use concise plain English.

Write short sentences. Name the file, command, or variable you mean. Skip filler.

## Tests

Playwright runs `health`, then `setup`, then `api`, then the Chromium and WebKit UI projects. The health check is `GET /api/health` and expects `{ "status": "ok" }`. The UI projects reuse the saved session.

`allure-playwright` writes `allure-results` on every run. Results stay in that folder until it is deleted. `pnpm allure:report` builds `allure-report` from those files. CI passes `--reporter=html,github,allure-playwright` because that flag replaces the reporters in `playwright.config.ts`.

`VENTION_LOCALE` sets the UI project `locale`. It defaults to `en-CA`. `pages/machine-builder.page.ts` holds the current Machine Builder labels in `roleName`.

`fixtures/design.fixture.ts` creates a design and deletes it on teardown. UI tests use `fixtures/machine-builder.fixture.ts`, which opens Machine Builder for that design. Call GraphQL through the helpers in `api/` instead of posting queries from the test.

Page objects live in `pages/`. Locate elements with `getByRole` first. If the element has no usable role, use its `data-test-id` with `getByTestId`.

Login writes `.auth/user.json`. It stops when the organization requires SSO or the account asks for a verification code.
