# Playwright Automation Example

A reference Playwright project demonstrating UI, API, and table-interaction testing. UI specs target self-hosted helper pages at `https://adrianjiga.github.io/qa/helpers/*` (originally migrated from DemoQA), API specs hit `jsonplaceholder.typicode.com`, and `waitExample.spec.js` exercises wait patterns against `docs.cypress.io`. Features Page Object Model architecture, Faker-based test data factories, multi-browser and responsive viewport coverage, and a sharded GitHub Actions pipeline with merged blob reports.

> **Architecture** — this repository is one of six that behave as a single system.
> The [cross-repo architecture notes](https://adrianjiga.github.io/qa/architecture)
> cover the `data-cy` contract, the coordinated-deploy problem, and the known gaps.

## Features

- **Page Object Model** - Clean separation of test logic and page interactions
- **Test Data Factories** - Dynamic test data generation with Faker.js
- **Multi-Browser Testing** - Chromium, Firefox, and WebKit support
- **Responsive Testing** - Mobile, tablet, and desktop viewport configurations
- **API Testing** - RESTful CRUD assertions via Playwright's built-in `request` fixture
- **Docker Support** - Containerized test execution
- **CI/CD Ready** - GitHub Actions workflows for automated testing
- **HTML Reports** - Built-in Playwright HTML reports with traces
- **Test Filtering** - Tag-based test execution with grep patterns

## Prerequisites

- Node.js v20.0.0 or higher
- npm v10.0.0 or higher
- Docker (optional, for containerized execution)

## Installation

```bash
git clone https://github.com/adrianjiga/PlaywrightAutomationExample
cd PlaywrightAutomationExample
npm install
npx playwright install
```

## Project Structure

```
├── tests/
│   ├── e2e/                          # Test specifications
│   │   ├── accessibility.spec.js     # Accessibility audits with baselines
│   │   ├── api.spec.js               # JSONPlaceholder API tests
│   │   ├── buttons.spec.js           # Button interaction tests
│   │   ├── registerForm.spec.js      # Form validation tests
│   │   ├── waitExample.spec.js       # Custom wait patterns
│   │   └── webTables.spec.js         # Table CRUD operations
│   └── fixtures/                     # Test data files
│       └── sampleUpload.json        # Picture-upload payload for the register form
├── pages/                            # Page Object Models
│   ├── ButtonsPage.js
│   ├── RegisterFormPage.js
│   ├── WebTablesPage.js
│   └── index.js
├── utils/
│   ├── accessibility.js              # Analyzer injection + baseline assertion
│   ├── factories.js                  # Faker-based test data factories
│   └── index.js
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # PR validation workflow
│   │   └── playwrightTests.yml      # Scheduled + on-push workflow with sharded matrix
│   ├── CODEOWNERS
│   └── dependabot.yml
├── playwright.config.js              # Playwright configuration
├── playwright.merge.config.js        # Reporter config for the CI merge-reports job
├── compose.yaml                # Docker services
├── Dockerfile
├── eslint.config.js                  # ESLint configuration
├── jsconfig.json                     # JavaScript/IDE configuration
├── tsconfig.json                     # TypeScript configuration
├── CLAUDE.md                         # Repo conventions and gotchas
├── .prettierrc
├── LICENSE
└── package.json
```

## Running Tests

### Interactive Mode (UI Mode)

```bash
npx playwright test --ui
```

### Headless Execution

```bash
# Run all tests
npm test

# Run by tag
npm run test:ui           # UI tests (@ui)
npm run test:api          # API tests (@api)
npm run test:webtables    # Table tests (@webTables)
npm run test:smoke        # Smoke tests (@smoke)
npm run test:a11y         # Accessibility audits (@a11y)
```

### Browser Selection

```bash
npm run test:browser:chromium
npm run test:browser:firefox
npm run test:browser:webkit
```

### Viewport Testing

```bash
npm run test:viewport:mobile    # 375x667
npm run test:viewport:tablet    # 768x1024
npm run test:viewport:desktop   # 1920x1080
```

### Debug Mode

```bash
npm run test:debug
# Or with specific test
npx playwright test buttons.spec.js --debug
```

### Docker Execution

```bash
# All tests
npm run test:docker

# Individual test suites
docker compose up --build uiTests
docker compose up --build apiTests
docker compose up --build webtablesTests

# Cleanup
npm run docker:clean
```

## Test Categories

### UI Tests (`@ui`)

| Test File              | Coverage                                              |
| ---------------------- | ----------------------------------------------------- |
| `buttons.spec.js`      | Double click, right click, dynamic click interactions |
| `registerForm.spec.js` | Form validation, field errors, complete submission    |
| `waitExample.spec.js`  | Built-in waiting patterns and polling                 |

### API Tests (`@api`)

| Test File     | Coverage                                                                        |
| ------------- | ------------------------------------------------------------------------------- |
| `api.spec.js` | JSONPlaceholder CRUD — GET a todo, POST a new post, PUT to update, DELETE by id |

### Web Tables Tests (`@webTables`)

| Test File           | Coverage                                                     |
| ------------------- | ------------------------------------------------------------ |
| `webTables.spec.js` | Search, edit, add, delete records, pagination, rows per page |

### Accessibility Tests (`@a11y`)

| Test File                | Coverage                                                              |
| ------------------------ | --------------------------------------------------------------------- |
| `accessibility.spec.js` | Per-page audits of buttons, web tables, and the register form — plus the register form in its submitted state, where the confirmation modal is only present at runtime |

## Page Objects

The framework uses Page Object Model for maintainable test code:

```javascript
import { test, expect } from "@playwright/test";
import { ButtonsPage } from "../../pages/index.js";

test.describe("Buttons", () => {
  let buttonsPage;

  test.beforeEach(async ({ page }) => {
    buttonsPage = new ButtonsPage(page);
    await buttonsPage.visit();
  });

  test("should interact with double click button @ui @smoke", async () => {
    await buttonsPage.performDoubleClick();
    await buttonsPage.verifyDoubleClickMessage();
  });
});
```

## Test Data Factories

Generate dynamic test data with Faker.js:

```javascript
import { userFactory } from "../../utils/factories.js";

const user = userFactory.generate();
// { firstName, lastName, email, age, salary, department }

const formUser = userFactory.generateFormUser();
// { firstName, lastName, email, mobile, address }

const age = userFactory.generateAge();
// Random integer in [18, 65]

const users = userFactory.generateBatch(5);
// Array of 5 user objects, firstName forced to User0..User4 for ordering assertions
```

## Configuration

### Locator convention

Page objects address every element through `[data-cy="..."]` — no ids, no `label[for=...]`,
no CSS classes. Test hooks are explicit contract; an id or class is an implementation detail
that can change for styling or refactoring reasons and take the suite down with it.

Ids remain on the helper site because the Selenium project still uses them, but nothing here
does. A new locator with no `data-cy` hook means adding one to the helper site rather than
reaching for an id.

Country and city options are addressed by **name** (`state-option-germany`,
`city-option-berlin`) rather than the position the old ids encoded, so
`selectState("germany")` states what it means where `selectState(0)` did not.

### Page-Owned URLs

There is no top-level `baseURL` in `playwright.config.js`. Each page object owns its full URL in a `url` field and `visit()` calls `page.goto(this.url)`. To target a new host, give the page object its own absolute URL — don't rely on `page.goto("/")` patterns.

### Viewport Presets

| Name    | Dimensions  |
| ------- | ----------- |
| mobile  | 375 x 667   |
| tablet  | 768 x 1024  |
| desktop | 1920 x 1080 |

### Test Retries

- `retries: 2` is set unconditionally in `playwright.config.js`. CI additionally forces `workers: 1` for deterministic ordering; locally workers default to the Playwright auto-pick.

## CI/CD

### Pull Request Validation (`ci.yml`)

Runs on every PR to `main`:

- Linting
- Format checking
- Typecheck (`tsc --noEmit`)
- Smoke tests (chromium only)

### Scheduled Test Execution (`playwrightTests.yml`)

- **Schedule**: Monday–Friday at 07:00 UTC
- **Triggers**: Push to `main`, manual dispatch
- **Main matrix**: Groups (`@api`, `@ui`, `@webTables`, `@a11y`) × Browsers (`chromium`, `firefox`). `@api` is skipped on firefox, and so is `@a11y` — the analyzer inspects the DOM rather than rendering, so a second engine costs runtime without adding signal.
- **Responsive matrix**: `mobileChrome` (chromium) and `tablet` (webkit), running `@ui` only. The `include:` form pairs each viewport with the browser it needs to install.
- **Merge step**: Each shard uploads a blob report; a downstream `merge-reports` job merges them via `playwright.merge.config.js`.

### Artifacts

Test artifacts are retained for 30 days:

- Screenshots (on failure)
- Videos (on failure only)
- Traces (on first retry)
- HTML reports

### Action Pinning

All third-party actions in `.github/workflows/` are pinned to full commit SHAs with a trailing version comment (e.g. `actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1`). This follows GitHub's security hardening guidance: SHAs are immutable, so a compromised tag cannot silently re-point at malicious code. Dependabot recognizes the pattern and bumps both the SHA and the comment together on its weekly schedule.

## Reports

### View HTML Report

```bash
npm run report
# Or
npx playwright show-report
```

### Report Locations

Local runs (config defaults):

| Type                          | Path                                              |
| ----------------------------- | ------------------------------------------------- |
| HTML                          | `reports/html/` (open with `npm run report:open`) |
| JSON                          | `reports/results.json`                            |
| JUnit                         | `reports/junit.xml`                               |
| Traces / screenshots / videos | `test-results/`                                   |

CI runs use `list` + `blob` + the GitHub Actions reporter; blob reports are merged into `reports/final/` by the downstream `merge-reports` job.

## Code Quality

### Linting

```bash
npm run lint          # Check issues
npm run lint:fix      # Auto-fix issues
```

### Formatting

```bash
npm run format        # Format files
npm run format:check  # Verify formatting
```

### Type Checking

```bash
npm run typecheck     # Run TypeScript checks
```

## Docker Configuration

Each test container runs with:

- Base image: `mcr.microsoft.com/playwright` — the tag is declared in the
  [`Dockerfile`](Dockerfile) and deliberately not repeated here, because a version written
  in two places drifts. It is kept in lockstep with the `@playwright/test` npm dep: the
  image ships the browser binaries for that exact release, and if the two drift apart
  Playwright refuses to launch with a version-mismatch error. Both are on the same weekly
  Dependabot schedule, so they move together — but they arrive as separate PRs, so merge
  them together.
- Memory limit: 2GB
- Memory reservation: 1GB

`compose.yaml` defines six services: `playwrightTests` (everything), `uiTests`,
`apiTests`, `webtablesTests` (tag-filtered), and `chromiumTests` / `firefoxTests`
(project-filtered).

## Dependency Management

Dependabot monitors and updates:

- npm packages (weekly, Mondays)
- Docker images (weekly, Mondays)
- GitHub Actions (weekly, Mondays)

## Useful Commands

```bash
# Generate test code with codegen
npm run codegen

# View trace files
npm run trace

# Run specific test file
npx playwright test buttons.spec.js

# Run with specific tag
npx playwright test --grep @smoke

# Run excluding tag
npx playwright test --grep-invert @api

# Run in parallel
npm run test:parallel

# Run serially
npm run test:serial
```

## Cleanup

```bash
npm run clean          # Remove reports, test-results, cache
npm run clean:reports  # Remove reports only
npm run docker:clean   # Remove Docker volumes and orphans
```

## Known gaps

Tracked deliberately rather than left for a reader to discover:

- **`@smoke` covers one test.** Only `buttons.spec.js:should interact with double click button`
  carries the tag, so the `ci.yml` PR gate exercises a single interaction. The sibling Cypress
  project tags one test per spec file; this one should match.
- **API specs assert literal values, not schemas.** `api.spec.js` checks
  `body.title === "delectus aut autem"` rather than validating response shape. The Cypress
  project uses Ajv and the Selenium project uses REST Assured's
  `matchesJsonSchemaInClasspath`; this project has no equivalent.
- **No visual regression or performance assertions.** Accessibility is now covered (see below);
  the other two dimensions are still absent.

## Accessibility

`tests/e2e/accessibility.spec.js` audits each helper page with the analyzer from
[WebQualityAnalyzer](https://github.com/adrianjiga/WebQualityAnalyzer) — the same engine behind
that project's browser extension, consumed as an injectable library rather than adding a second
a11y tool to the stack.

```bash
npm run test:a11y
```

Each page declares a **baseline** of accepted issues, and the assertion is two-way:

1. An issue not in the baseline fails — a new regression.
2. A baseline entry that no longer occurs **also** fails — the debt was paid, so delete the line.

Direction 2 is what stops the baseline becoming a suppression list that only ever grows. All
three pages currently sit at **zero**: the four issues originally recorded were real defects,
fixed at the source in adrianjiga.github.io#12, and this suite failed until the entries were
removed.

Only accessibility is asserted. SEO and performance are disabled in `auditAccessibility` —
they audit page quality rather than the behaviour under test.

## Comparison with Cypress

| Feature            | Playwright                 | Cypress               |
| ------------------ | -------------------------- | --------------------- |
| Multi-browser      | Chromium, Firefox, WebKit  | Chrome, Firefox, Edge |
| Parallel execution | Built-in                   | Requires Dashboard    |
| API testing        | Native support             | Plugin required       |
| Mobile emulation   | Built-in                   | Limited               |
| Auto-waiting       | Built-in                   | Built-in              |
| Trace viewer       | Built-in                   | Video only            |
| Language support   | JS, TS, Python, .NET, Java | JS, TS                |

## Author

**Adrian Jiga**  
[GitHub](https://github.com/adrianjiga) | [Email](mailto:jiga.ion.adrian@gmail.com)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
