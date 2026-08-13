# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project at a glance

A Playwright reference project demonstrating UI, API, and table-interaction testing. Tests do **not** all target the same site:

- **UI suites** (`buttons.spec.js`, `registerForm.spec.js`, `webTables.spec.js`) point at **self-hosted helper pages** under `https://adrianjiga.github.io/qa/helpers/*`. These were migrated from `demoqa.com` because DemoQA's React-based pages were unreliable and ad-laden.
- **`api.spec.js`** targets `jsonplaceholder.typicode.com` (public free API).
- **`waitExample.spec.js`** targets `docs.cypress.io` to demo wait patterns against a real third-party site.

`playwright.config.js` does **not** define a `baseURL` — each page object owns its full URL in a `url` field and `visit()` calls `page.goto(this.url)`. Don't rely on `page.goto("/")` patterns here; if you add a spec against a new host, give the page object its own absolute URL.

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

Specs are tagged in the test title with `@ui`, `@api`, `@webTables`, `@smoke`, `@a11y`. Accessibility specs carry **only** `@a11y` — tagging them `@ui` as well would run them again inside the `@ui` shard and the responsive job. The CI matrix and the `test:*` npm scripts both drive off `--grep <tag>`. When adding a new spec, tag it appropriately or it won't be picked up by the scheduled run.

### Test data factories

`utils/factories.js` exposes `userFactory.generate()`, `.generateFormUser()`, `.generateAge()`, and `.generateBatch(n)`, built on `@faker-js/faker`. Use these instead of hardcoding fixtures — the WebTables and Register Form suites depend on the field shapes they produce. Note `generate()` returns `age` and `salary` as **strings** (the table renders them as text and the specs compare against `textContent()`), while `generateAge()` returns a **number**.

### Projects (viewport × browser matrix)

`playwright.config.js` defines six projects: `chromium`, `firefox`, `webkit`, `mobileChrome`, `mobileSafari`, `tablet`. Mobile/tablet projects override viewport on top of the device preset. A test can opt out of a viewport via a describe-level predicate skip — see `waitExample.spec.js:5` for the precedent:

```js
test.skip(({ viewport }) => !!viewport && viewport.width < 768, "reason");
```

The `!!viewport &&` guard matters: `viewport` is nullable (a project can run with `viewport: null` for full-window mode), and dereferencing `.width` on null throws inside the skip predicate rather than skipping the test.

## Non-obvious gotchas

- **The practice form requires a date of birth to submit**, alongside first name, last name,
  mobile and gender — and it cannot be typed, only picked. Omitting it leaves the form blocked
  by validation. This bit the accessibility spec: `verifySubmissionSuccess()` originally used
  only `toContainText`, which does **not** require visibility, so it passed against a modal
  that never opened. It now asserts `toBeVisible()` first. Any new assertion on a
  conditionally-shown element needs the same care.

- **Accessibility baselines are two-way.** `expectAccessibilityBaseline` fails on a new issue
  *and* on a baseline entry that no longer occurs. Fixing the page is therefore expected to
  turn this suite red until the stale entry is deleted — that is the mechanism, not a bug.

- **Locators are `data-cy` only.** Page objects address every element through
  `[data-cy="..."]`; no ids, no `label[for=...]`, no CSS classes. Ids still exist on the
  helper site because the Selenium project uses them, but nothing here should. A new locator
  that has no `data-cy` hook means adding one to the helper site, not reaching for an id.

- **Hidden radio inputs.** The helper Register Form hides `<input type="radio">` via `display: none` and exposes click targets via labels. `RegisterFormPage.selectGender()` clicks the **label** (`[data-cy="gender-male-label"]` and siblings), not the input — `check()` on the input will throw "not visible." If you add another radio-group interaction, mirror this label-click pattern.

- **Custom date picker.** The helper page uses a custom datepicker (`[data-cy="month-select"]`, `[data-cy="year-select"]`, `[data-cy="day-XX"]`), **not** `react-datepicker`. Days are referenced by zero-padded string (`"01"`, not `1`).

- **Custom state/city dropdowns.** Options are addressed by **name**: `[data-cy="state-option-germany"]`, `[data-cy="city-option-berlin"]`. The city attribute is the visible name lower-cased with spaces hyphenated, matching how the page builds it. Cities are populated by the selected country, so `selectCity()` must follow `selectState()`. Available countries: Germany, France, Spain, Italy, Netherlands.

- **WebTables CRUD persists.** Because the helper writes to `localStorage`, a failing test mid-flight can leave behind a row that breaks the next run. Always invoke `WebTablesPage.visit()` in `beforeEach` rather than reusing a single `visit()` across tests.

- **`docs.cypress.io` on mobile hides the search button.** `waitExample.spec.js` skips viewports < 768px via a describe-level `test.skip(...)` predicate. If you add another spec against a public docs site, expect similar mobile chrome differences.

## CI/CD

Two workflows in `.github/workflows/`:

- `ci.yml` — PR validation against `main`: lint, format check, typecheck, smoke tests on chromium. It uploads `blob-report/`, not `playwright-report/` — the html reporter only runs locally.
- `playwrightTests.yml` — scheduled (Mon–Fri 07:00 UTC), on push to `main`, and on `workflow_dispatch`. Sharded matrix: `{api, ui, webTables, a11y}` × `{chromium, firefox}` (api and a11y skipped on firefox — a11y inspects the DOM, not rendering, so a second engine adds no signal) + responsive jobs for `mobileChrome` (chromium) and `tablet` (webkit), with a `merge-reports` job downstream. The responsive matrix uses `include:` form so each viewport carries its required browser — the install step keys off `matrix.browser`, so `tablet` installs webkit and `mobileChrome` installs chromium. If you add a viewport, add its browser to the same matrix entry.

All `actions/*` references are **pinned to full commit SHAs** with a trailing `# vX.Y.Z` comment (e.g. `actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1`). Dependabot recognizes this pattern and bumps both the SHA and the comment together — keep the format consistent when introducing new actions.

## What lives where

| Directory | Purpose |
|---|---|
| `pages/` | Page Object Models. Each PO owns its full URL and any "reset to known state" setup in `visit()`. |
| `tests/e2e/` | All specs. Test discovery is keyed off `testDir: "./tests/e2e"` in `playwright.config.js`. |
| `tests/fixtures/` | Static fixtures. `sampleUpload.json` is read by the Register Form spec as the picture-upload payload — the helper page accepts any file and echoes its basename back in the result table, which is what the assertion verifies. |
| `utils/factories.js` | Faker-based test data generators. |
| `utils/accessibility.js` | Injects the WebQualityAnalyzer bundle and asserts against a per-page baseline. |
| `reports/` | JSON + JUnit + HTML reporter output. HTML lands in `reports/html` (note: `npm run report` uses Playwright's default `playwright-report/` — `report:open` is the one that hits `reports/html`). |
| `test-results/` | Per-test trace, screenshot, and video artifacts. |
