/* eslint-disable no-undef */
import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright Configuration
 * @see https://playwright.dev/docs/test-configuration
 */

const environments = {
  prod: {
    baseURL: "https://demoqa.com",
    apiURL: "https://demoqa.com",
  },
};

const viewports = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1920, height: 1080 },
};

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [["list"], ["blob"], ["@estruyf/github-actions-reporter"]]
    : [
        ["list"],
        ["html", { outputFolder: "reports/html", open: "never" }],
        ["json", { outputFile: "reports/results.json" }],
        ["junit", { outputFile: "reports/junit.xml" }],
      ],
  use: {
    baseURL: environments[process.env.TEST_ENV || "prod"].baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  expect: {
    timeout: 10000,
  },
  outputDir: "test-results",

  projects: [
    // Desktop browsers
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: viewports.desktop,
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        viewport: viewports.desktop,
      },
    },
    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        viewport: viewports.desktop,
      },
    },

    // Mobile viewports
    {
      name: "mobile-chrome",
      use: {
        ...devices["Pixel 5"],
        viewport: viewports.mobile,
      },
    },
    {
      name: "mobile-safari",
      use: {
        ...devices["iPhone 12"],
        viewport: viewports.mobile,
      },
    },

    // Tablet viewport
    {
      name: "tablet",
      use: {
        ...devices["iPad (gen 7)"],
        viewport: viewports.tablet,
      },
    },
  ],

  // Global setup/teardown
  globalSetup: undefined,
  globalTeardown: undefined,
});
