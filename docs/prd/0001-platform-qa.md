---
Status: accepted
ID: 0001
Title: Platform QA for the Machine Builder challenge
Date: 2026-10-28
Flow: manual
---
# PRD 0001: Platform QA for the Machine Builder challenge

## Problem statement

I need to create a test project for this code challenge. Build a system that validates a vention.com feature through end-to-end tests, using a black-box approach. The system should validate that two Machine Motion Controllers cannot be added to the same Machine Builder design to be automated.

## Goals

- A repository named platform-qa.
- A CI pipeline that runs it.
- A black-box end-to-end check that two Machine Motion controllers cannot both be set up to automate the same Machine Builder design.

## Non-goals

- The reliability-process document in section 1 of the challenge.
- The EtherCAT bonus.
- Edge firmware.
- Firefox and Edge.
- Validating UI labels or translated strings. Label checks belong in frontend integration tests. A later iteration can add an end-to-end smoke check for a subset of those strings.
- Confidential material from a current or former employer.

## Target users and primary use cases

The Vention reviewers who receive the platform-qa repository by a GitHub link, and anyone who runs the suite from the README.

The primary use case is a black-box pass over vention.com Machine Builder. The suite signs in once, creates a disposable design, places MachineMotion AI controllers, and checks the configuration pane. The property inspector for the Machine Motion AI controller is the surface under test. As a machine is assembled, a software-defined configuration is generated. The reviewer can also run the suite in CI.

## Functional requirements

These requirements are the backlog, in build order. Each numbered item is one issue. The title is the JIRA summary. A test issue includes the Gherkin. Description and acceptance criteria are the two JIRA fields.

1. Scaffold the Playwright repository. The package is named `vention-platform-qa`, uses ES modules, and pins Node `24.22.1` and pnpm `11.15.0`. It includes Playwright, TypeScript, ESLint, Prettier, Husky, and Allure. The tree can grow into API helpers, fixtures, page objects, setup, API tests, and UI tests. `pnpm exec playwright test` runs.

2. Ignore secrets and generated files. Ignore `.env.local`, `.auth/`, `.playwright-cli/`, `test-results/`, `playwright-report/`, `allure-results/`, `allure-report/`, and `tmp/`. Commit `.env.local.example`.

3. Document how to run the tests. The README lists `VENTION_URL`, `VENTION_EMAIL`, `VENTION_PASSWORD`, and `VENTION_LOCALE`. It states the order: health, sign-in, API, then Chromium and WebKit. It lists the commands for health, setup, API, UI mode, each browser and locale, lint, format, and Allure. `AGENTS.md` says disposable designs are deleted when the test ends, including on failure, GraphQL goes through the client, elements are found by accessible name and then by `data-test-id`, and login stops for SSO and for a verification code.

4. Lint and format the code. `pnpm format` runs Prettier with single quotes. `pnpm lint` runs ESLint with the recommended JavaScript and TypeScript rules, and the Prettier config last. Prettier skips the lockfile, the report folders, and `tmp`.

5. Run checks from git hooks. `pnpm install` installs the Husky hooks through `prepare`. Pre-commit runs `pnpm lint` and `pnpm format:check`. It does not run `pnpm format`, because that rewrites files during the commit. Pre-push runs `pnpm audit` and does not run lint. If audit fails on a dependency Allure pulled in, pin it in the workspace file.

6. Read run settings from the environment. The Playwright config loads `.env.local` itself. CI injects the same names. `.env.local.example` lists `VENTION_URL`, `VENTION_EMAIL`, and `VENTION_PASSWORD`. `VENTION_LOCALE` is `en-CA` or `fr-CA` and defaults to `en-CA`. Any other value fails when the config loads, and the error names the two allowed values. A missing `VENTION_URL` fails the run and names that variable. Login and API calls use that URL.

7. Run health, sign-in, API, then the browsers. Five projects, in that order, unless a command turns dependencies off. Health has no session. Sign-in writes one and depends on health. API reuses the session, depends on sign-in, and does not run the health spec again. Chromium and WebKit reuse the session, depend on API, take `locale` from `VENTION_LOCALE`, and use a 1280×720 viewport. `baseURL` is `VENTION_URL`. `pnpm health` runs health. `pnpm setup` signs in and does not run health. `pnpm api` runs the API project and still runs sign-in and health first. `pnpm chromium:en`, `pnpm chromium:fr`, `pnpm webkit:en`, and `pnpm webkit:fr` set the locale and run that browser, dependencies included. `pnpm ui` opens the Playwright UI for these projects. CI retries a failure twice, refuses `test.only`, and keeps a trace on the first retry. A local run does not retry.

8. Keep the Machine Builder labels in one place. `VENTION_LOCALE` sets the browser locale. The English strings on the page object are the accessible names the `getByRole` locators use: search (`Search for Parts...`), `Start building now`, `3D Model`, `Assembly instructions`, and `Delete Controller`. UI specs import those names. The builder path is `/machine-builder/{designId}`. There is no French string file. An `fr-CA` run still uses the English names.

9. Sign in once and reuse the session. Setup logs in, turns instructor hints off, and writes `.auth/user.json` with at least one cookie. Later projects reuse that file. The run stops, without printing the password and without a usable session, when `VENTION_URL`, `VENTION_EMAIL`, or `VENTION_PASSWORD` is missing, when the organization requires SSO, or when the account asks for a verification code. SSO stops before the password is sent. A verification code stops before the session is saved.

10. Call GraphQL from one client. Tests reach `/graphql` on `VENTION_URL` through that client. A bad HTTP status, a GraphQL `errors` list, or a body with no `data` throws. The client can return the CSRF token from the site HTML. Requests send the site as the origin.

11. Create, price, and delete designs. The Machine Builder API creates a design, deletes a design, and adds catalog parts through the price endpoint. The in-stock parts are MachineMotion AI `CE-CL-030-1500`, MachineMotion AI Robot `CE-CL-030-0000`, MachineMotion AI Pro `CE-CL-031-3000`, and MachineMotion AI Robot Pro `CE-CL-031-0000`. Create returns the id and the name. Delete throws when the response says it did not work. Adding parts sends positive quantities, the CSRF token, and a referer on that design. An unknown part, a quantity under 1, or an empty list fails before the request is sent. The price result exposes the bill of materials with part number, name, and quantity.

12. Check the health endpoint. The health project only. The API project does not run this spec.

    ```gherkin
    Feature: Platform health

      Scenario: The platform answers before anyone signs in
        Given I am not signed in
        When I call GET /api/health
        Then the response is successful
        And the body is { "status": "ok" }
    ```

13. Create and delete a disposable design. The name starts with `QA disposable` so a leftover is recognizable.

    ```gherkin
    Feature: Disposable designs

      Background:
        Given a design will be created for this scenario
        And that design is deleted when the scenario ends, including when it fails

      Scenario: Create a disposable design
        When the design is created with a name starting with "QA disposable"
        Then it has an id
        And the name starts with "QA disposable" and ends with digits
    ```

14. Add controllers and check the bill of materials. Add the controllers through the price call.

    ```gherkin
    Feature: Price bill of materials

      Background:
        Given a disposable design
        And that design is deleted when the scenario ends, including when it fails

      Scenario: Add one MachineMotion AI and two MachineMotion AI Pro
        When I add 1 MachineMotion AI "CE-CL-030-1500"
        And I add 2 MachineMotion AI Pro "CE-CL-031-3000"
        Then the bill of materials includes "CE-CL-030-1500" "MachineMotion AI" with quantity 1
        And the bill of materials includes "CE-CL-031-3000" "MachineMotion AI Pro" with quantity 2
    ```

15. Open Machine Builder and place a part. UI tests go through one page object. Open `/machine-builder/<designId>`. A failed navigation fails the test. If the cookie dialog is up, decline it. Click `Start building now` and wait until search is on screen. Instructor hints are already off from setup. Search, the bill of materials actions, and Delete Controller use the accessible names from the page object. Tabs, part tiles, bill of materials rows, and configuration rows use `data-test-id`. Placing a part waits until the image has loaded, waits until insertion finishes, clicks the canvas, and returns the price response for that part number. A failed price response names the part. A missing canvas says the canvas is not visible.

16. Check one MachineMotion AI in the bill of materials. Chromium and WebKit, both using the saved session. Each run gets a new `QA disposable` design, already open in Machine Builder.

    ```gherkin
    @chromium @webkit
    Feature: One MachineMotion AI

      Background:
        Given I am signed in
        And a disposable design is open in Machine Builder
        And that design is deleted when the scenario ends, including when it fails

      Scenario: The bill of materials and configuration show the controller I placed
        When I open the bill of materials
        Then I see the "3D Model" action
        And I see the "Assembly instructions" action
        When I search for "Controllers"
        Then I see the four catalog controllers
        When I place MachineMotion AI "CE-CL-030-1500" on the canvas
        Then the price request for that part succeeds
        And the bill of materials shows "MachineMotion AI" with quantity 1
        When I open configuration
        Then configuration shows "MachineMotion AI"
        And there is 1 download
    ```

17. Check download configuration for two controllers. This is the challenge check. Two Machine Motion controllers on one design cannot both be set up to automate that machine. The check is the configuration pane, on the property inspector for MachineMotion AI. Chromium and WebKit. Same cleanup as the other UI test.

    ```gherkin
    @chromium @webkit
    Feature: Two MachineMotion AI controllers

      Background:
        Given I am signed in
        And a disposable design is open in Machine Builder
        And that design is deleted when the scenario ends, including when it fails

      Scenario: Download configuration flags both controllers, then one can be removed
        When I open configuration
        Then download configuration lists 0 controllers
        When I place a MachineMotion AI "CE-CL-030-1500" on the canvas
        And I open configuration
        Then download configuration lists 1 controller
        When I place a second MachineMotion AI "CE-CL-030-1500" on the canvas
        And I open configuration
        Then download configuration lists 2 controllers
        And those rows show 2 alerts
        When I open the last controller
        Then its properties are visible
        And "Delete Controller" is visible
        When I delete that controller
        Then download configuration lists 1 controller
        And that row shows no alert
        And "Delete Controller" is no longer visible
    ```

18. Record results with Allure. Every Playwright run writes `allure-results`. `pnpm allure:report` builds `allure-report` from that folder. `pnpm allure:open` opens it. Results stay until someone deletes the folder. The README says to delete `allure-results` when the report should cover one run. The report environment includes the OS, the Node version, and the locale.

19. Run the suite in GitHub Actions. The workflow runs on pull requests, on pushes to `master`, and from a manual run. A manual run can choose `all`, `health`, `setup`, `api`, `chromium`, or `webkit`, can choose `en-CA` or `fr-CA`, and can pass a grep. Pull requests and pushes to `master` run the full suite with `VENTION_LOCALE` `en-CA`. The job uses Node `24.22.1`, pnpm `11.15.0`, and `pnpm install --frozen-lockfile`. `VENTION_URL` is a repository variable. `VENTION_EMAIL` and `VENTION_PASSWORD` are secrets. The job runs Playwright with the HTML, GitHub, and Allure reporters, because that flag replaces the reporters in the config. It uploads `playwright-report`. When Allure results exist, it builds `allure-report`, uploads it, and posts a summary on the pull request. A newer run on the same ref cancels the older one.

## Non-functional requirements

vention.com is a black box. The suite does not depend on Vention source code.

A disposable design is deleted when the scenario ends, including when the scenario fails.

Login errors name the missing variable and do not include the password.

Node is `24.22.1`. pnpm is `11.15.0`.

## Success metrics

| Metric | Definition | Baseline | Target | Window |
| --- | --- | --- | --- | --- |
| The challenge states no number. Success is a repository named platform-qa, a CI pipeline that runs it, and a black-box end-to-end check that two Machine Motion controllers cannot both be set up to automate the same Machine Builder design. | The three deliverables exist, and the two-controller scenario passes on Chromium and WebKit. | TBD — owner: product | TBD — owner: product | TBD — owner: product |

## Open questions

| Question | Owner |
| --- | --- |
| The challenge states no number for how success is measured beyond the three deliverables. | product |
