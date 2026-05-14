# Playwright Automation Example

A production-ready Playwright testing framework demonstrating UI, API, and table interaction testing patterns using the DemoQA website. Features Page Object Model architecture, test data factories, multi-browser support, responsive testing, and CI/CD integration.

## Features

- **Page Object Model** - Clean separation of test logic and page interactions
- **Test Data Factories** - Dynamic test data generation with Faker.js
- **Multi-Browser Testing** - Chromium, Firefox, and WebKit support
- **Responsive Testing** - Mobile, tablet, and desktop viewport configurations
- **API Testing** - RESTful API validation with schema verification
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
│   │   ├── api.spec.js               # Book Store API tests
│   │   ├── buttons.spec.js           # Button interaction tests
│   │   ├── registerForm.spec.js      # Form validation tests
│   │   ├── waitExample.spec.js       # Custom wait patterns
│   │   └── webTables.spec.js         # Table CRUD operations
│   └── fixtures/                     # Test data files
│       └── book.json
├── pages/                            # Page Object Models
│   ├── ButtonsPage.js
│   ├── RegisterFormPage.js
│   ├── WebTablesPage.js
│   └── index.js
├── utils/
│   ├── apiHelpers.js                 # API testing utilities
│   ├── factories.js                  # Test data factories
│   └── index.js
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # PR validation workflow
│   │   └── playwright-tests.yml      # Main test execution workflow
│   ├── CODEOWNERS
│   └── dependabot.yml
├── playwright.config.js              # Playwright configuration
├── docker-compose.yml                # Docker services
├── Dockerfile
├── eslint.config.js                  # ESLint configuration
├── jsconfig.json                     # JavaScript/IDE configuration
├── tsconfig.json                     # TypeScript configuration
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
docker compose up --build ui-tests
docker compose up --build api-tests
docker compose up --build webtables-tests

# Cleanup
npm run docker:clean
```

## Test Categories

### UI Tests (`@ui`)

| Test File | Coverage |
|-----------|----------|
| `buttons.spec.js` | Double click, right click, dynamic click interactions |
| `registerForm.spec.js` | Form validation, field errors, complete submission |
| `waitExample.spec.js` | Built-in waiting patterns and polling |

### API Tests (`@api`)

| Test File | Coverage |
|-----------|----------|
| `api.spec.js` | Book Store API - list books, fetch by ISBN, error handling, CRUD operations |

### Web Tables Tests (`@webTables`)

| Test File | Coverage |
|-----------|----------|
| `webTables.spec.js` | Search, edit, add, delete records, pagination, rows per page |

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

const users = userFactory.generateBatch(5);
// Array of 5 user objects
```

## API Helpers

```javascript
import { API_CONFIG, validateBookSchema, validateResponse } from "../../utils/apiHelpers.js";

// Make API request
const response = await request.get(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.books}`);

// Validate response
await validateResponse(response, expect, 200);

// Validate schema
validateBookSchema(book, expect);
```

## Configuration

### Environment Configuration

```javascript
// playwright.config.js
const environments = {
  prod: {
    baseURL: "https://demoqa.com",
    apiURL: "https://demoqa.com",
  },
};
```

### Viewport Presets

| Name | Dimensions |
|------|------------|
| mobile | 375 x 667 |
| tablet | 768 x 1024 |
| desktop | 1920 x 1080 |

### Test Retries

- CI mode: 2 retries
- Local mode: 0 retries

## CI/CD

### Pull Request Validation (`ci.yml`)

Runs on every PR to master:
- Linting
- Format checking
- Smoke tests

### Scheduled Test Execution (`playwright-tests.yml`)

- **Schedule**: Monday-Friday at 07:00 UTC
- **Triggers**: Push to master, manual dispatch
- **Matrix**: 
  - Groups: API, UI, WebTables
  - Browsers: Chromium, Firefox
  - Viewports: Desktop, Mobile, Tablet

### Artifacts

Test artifacts are retained for 30 days:
- Screenshots (on failure)
- Videos (on failure only)
- Traces (on first retry)
- HTML reports

## Reports

### View HTML Report

```bash
npm run report
# Or
npx playwright show-report
```

### Report Locations

| Type | Directory |
|------|-----------|
| HTML | `playwright-report/` |
| JSON | `reports/results.json` |
| JUnit | `reports/junit.xml` |
| Traces | `test-results/` |

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
- Base image: `mcr.microsoft.com/playwright:v1.49.1-noble`
- Memory limit: 2GB
- Memory reservation: 1GB

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

## Comparison with Cypress

| Feature | Playwright | Cypress |
|---------|------------|---------|
| Multi-browser | Chromium, Firefox, WebKit | Chrome, Firefox, Edge |
| Parallel execution | Built-in | Requires Dashboard |
| API testing | Native support | Plugin required |
| Mobile emulation | Built-in | Limited |
| Auto-waiting | Built-in | Built-in |
| Trace viewer | Built-in | Video only |
| Language support | JS, TS, Python, .NET, Java | JS, TS |

## Author

**Adrian Jiga**  
[GitHub](https://github.com/adrianjiga) | [Email](mailto:jiga.ion.adrian@gmail.com)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
