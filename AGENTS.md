AGENTS.md and other documentation files should use concise plain English.

Write short sentences. Name the file, command, or variable you mean. Skip filler.

Read `README.md` for how to run the suite. Read `playwright.config.ts` for project order, locale, and reporters.

## Tests

`fixtures/design.fixture.ts` creates a design and deletes it when the test ends, including on failure. UI tests use `fixtures/machine-builder.fixture.ts`, which opens Machine Builder for that design.

Call GraphQL through the helpers in `api/`. Do not post queries from the test.

Page objects live in `pages/`. `pages/machine-builder.page.ts` holds the current Machine Builder labels in `roleName`. Locate elements with `getByRole` first. If the element has no usable role, use its `data-test-id` with `getByTestId`.

Login writes `.auth/user.json`. It stops when the organization requires SSO or the account asks for a verification code.

CI passes `--reporter=html,github,allure-playwright`. That flag replaces the reporters in `playwright.config.ts`.
