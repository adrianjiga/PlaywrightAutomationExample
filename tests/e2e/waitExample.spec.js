import { test, expect } from "@playwright/test";

test.describe("Test Cypress Docs with waitUntil equivalent", () => {
  // eslint-disable-next-line playwright/no-skipped-test -- intentional viewport gate, see CLAUDE.md
  test.skip(
    ({ viewport }) => !!viewport && viewport.width < 768,
    "Cypress docs hides the search button behind a hamburger menu on narrow viewports"
  );

  test("Waits for the search button to be visible and clicks it @ui", async ({
    page,
  }) => {
    await page.goto("https://docs.cypress.io");

    const searchButton = page.getByRole("button", { name: /Search/i });

    await expect(searchButton).toBeVisible({ timeout: 15000 });
    await searchButton.click();

    const searchInput = page.locator("#docsearch-input");
    await expect(searchInput).toBeVisible({ timeout: 10000 });
  });

  test("Alternative approach with polling @ui", async ({ page }) => {
    await page.goto("https://docs.cypress.io");

    // Using expect.poll for custom polling scenarios
    await expect
      .poll(
        async () => {
          const button = page.getByRole("button", { name: /Search/i });
          return button.isVisible();
        },
        {
          message: "Waiting for search button to be visible",
          intervals: [500, 1000, 1000],
          timeout: 15000,
        }
      )
      .toBe(true);

    await page.getByRole("button", { name: /Search/i }).click();
    await expect(page.locator("#docsearch-input")).toBeVisible();
  });

  // This test exists to demonstrate the legacy waitForSelector + page.click
  // pattern alongside the modern locator approaches above.
  /* eslint-disable playwright/no-wait-for-selector, playwright/prefer-locator */
  test("Using waitForSelector for dynamic content @ui", async ({ page }) => {
    await page.goto("https://docs.cypress.io");

    await page.waitForSelector('button:has-text("Search")', {
      state: "visible",
      timeout: 15000,
    });

    await page.click('button:has-text("Search")');

    await page.waitForSelector("#docsearch-input", {
      state: "visible",
      timeout: 10000,
    });

    await expect(page.locator("#docsearch-input")).toBeVisible();
  });
  /* eslint-enable playwright/no-wait-for-selector, playwright/prefer-locator */
});
