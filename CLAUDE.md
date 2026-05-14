# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project at a glance

A Playwright reference project demonstrating UI, API, and table-interaction testing. Tests do **not** all target the same site:

- **UI suites** (`buttons.spec.js`, `registerForm.spec.js`, `webTables.spec.js`) point at **self-hosted helper pages** under `https://adrianjiga.github.io/qa/helpers/*`. These were migrated from `demoqa.com` because DemoQA's React-based pages were unreliable and ad-laden.
- **`api.spec.js`** targets `jsonplaceholder.typicode.com` (public free API).
- **`waitExample.spec.js`** targets `docs.cypress.io` to demo wait patterns against a real third-party site.

`playwright.config.js` still defines `baseURL: "https://demoqa.com"`, but the page objects override it with full URLs in their `url` field, so `baseURL` is effectively unused. Don't rely on `page.goto("/")` patterns here.

## Common commands

```bash
# Single test file
npx playwright test buttons.spec.js

# Single test by title substring
npx playwright test -g "should interact with double click"

# Tag + project together (this is how CI shards work)
npx playwright test --grep @smoke --project=chromium

# Re-run only failed tests
npx playwright test --last-failed

# Inspect a trace from test-results/
npx playwright show-trace test-results/<dir>/trace.zip

# Local lint + format check (mirrors CI)
npm run lint && npm run format:check && npm run typecheck
```

The npm scripts in `package.json` cover the common matrix permutations (`test:browser:*`, `test:viewport:*`, `test:smoke`, etc.) — prefer those over re-deriving the CLI flags.

## Architecture

### Page Object pattern

Page objects in `pages/` follow a chainable convention: every action method returns `this`. They also expose a static `messages` / `validationColor` map for assertion constants. Each page object owns its full URL (no relative paths), and `visit()` is responsible for any setup required to make the page deterministic — most importantly:

- `WebTablesPage.visit()` clears `localStorage` and reloads. The helper site persists records across reloads, so without the clear, tests inherit dirty state from a prior run.

### Test tags

Specs are tagged in the test title with `@ui`, `@api`, `@webTables`, `@smoke`. The CI matrix and the `test:*` npm scripts both drive off `--grep <tag>`. When adding a new spec, tag it appropriately or it won't be picked up by the scheduled run.

### Test data factories

`utils/factories.js` exposes `userFactory.generate()`, `.generateFormUser()`, and `.generateBatch(n)`, built on `@faker-js/faker`. Use these instead of hardcoding fixtures — the WebTables and Register Form suites depend on the field shapes they produce.

### Projects (viewport × browser matrix)

`playwright.config.js` defines six projects: `chromium`, `firefox`, `webkit`, `mobile-chrome`, `mobile-safari`, `tablet`. Mobile/tablet projects override viewport on top of the device preset. A test can opt out of a viewport via `test.skip(({ viewport }) => viewport.width < 768, "reason")` — see `waitExample.spec.js` for the precedent.

## Non-obvious gotchas

- **Hidden radio inputs.** The helper Register Form hides `<input type="radio">` via `display: none` and exposes click targets via labels. `RegisterFormPage.selectGender()` clicks the **label**, not the input — `check()` on the input will throw "not visible." If you add another radio-group interaction, mirror this label-click pattern.

- **Custom date picker.** The helper page uses a custom datepicker (`#dp-month`, `#dp-year`, `[data-cy="day-XX"]`), **not** `react-datepicker`. Days are referenced by zero-padded string (`"01"`, not `1`).

- **Custom state/city dropdowns.** Options are addressed by index (`#state-option-N`, `#city-option-N`), not by visible text. Available countries are Germany, France, Spain, Italy, Netherlands.

- **WebTables CRUD persists.** Because the helper writes to `localStorage`, a failing test mid-flight can leave behind a row that breaks the next run. Always invoke `WebTablesPage.visit()` in `beforeEach` rather than reusing a single `visit()` across tests.

- **`docs.cypress.io` on mobile hides the search button.** `waitExample.spec.js` skips viewports < 768px via a describe-level `test.skip(...)` predicate. If you add another spec against a public docs site, expect similar mobile chrome differences.

## CI/CD

Two workflows in `.github/workflows/`:

- `ci.yml` — PR validation: lint, format check, smoke tests. **Currently triggers on `pull_request: branches: [master]`**, but the repo's default branch is `main`. PRs into `main` therefore do not run this workflow. This is a known mismatch; treat it as a bug worth fixing rather than a feature.
- `playwright-tests.yml` — scheduled (Mon–Fri 07:00 UTC) and on push-to-master. Sharded matrix: `{api, ui, webTables}` × `{chromium, firefox}` (api skipped on firefox) + responsive jobs for `mobile-chrome` and `tablet`, with a `merge-reports` job downstream.

All `actions/*` references are **pinned to full commit SHAs** with a trailing `# vX.Y.Z` comment (e.g. `actions/checkout@de0fac2... # v6.0.2`). Dependabot recognizes this pattern and bumps both the SHA and the comment together — keep the format consistent when introducing new actions.

## What lives where

| Directory | Purpose |
|---|---|
| `pages/` | Page Object Models. Each PO owns its full URL and any "reset to known state" setup in `visit()`. |
| `tests/e2e/` | All specs. Test discovery is keyed off `testDir: "./tests/e2e"` in `playwright.config.js`. |
| `tests/fixtures/` | Static JSON fixtures. `book.json` is currently orphaned (the suite that consumed it was removed); safe to delete if cleanup comes up. |
| `utils/factories.js` | Faker-based test data generators. |
| `reports/` | JSON + JUnit + HTML reporter output. HTML lands in `reports/html` (note: `npm run report` uses Playwright's default `playwright-report/` — `report:open` is the one that hits `reports/html`). |
| `test-results/` | Per-test trace, screenshot, and video artifacts. |
