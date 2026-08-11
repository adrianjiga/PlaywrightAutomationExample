import { test, expect } from "@playwright/test";
import {
  ButtonsPage,
  RegisterFormPage,
  WebTablesPage,
} from "../../pages/index.js";
import {
  auditAccessibility,
  expectAccessibilityBaseline,
} from "../../utils/accessibility.js";

/**
 * Accessibility coverage for the helper pages, using the analyzer from the
 * WebQualityAnalyzer project (the same engine behind its browser extension).
 *
 * ## Why these tests have a baseline instead of asserting zero
 *
 * The helper pages have real, pre-existing accessibility defects. Asserting zero today would
 * make the suite red on arrival, which teaches everyone to ignore it. Instead each page
 * declares exactly what is currently wrong, and the assertion is two-way: a **new** issue
 * fails, and a baseline entry that stops occurring **also** fails so it must be deleted.
 *
 * The baseline is therefore a shrinking record of known debt, not a suppression list. Every
 * entry below is a genuine defect worth fixing on the helper site — when one is, this file
 * fails and tells you to remove the line.
 *
 * ## Scope
 *
 * Accessibility only. SEO and performance are disabled in `auditAccessibility` — they audit
 * page quality, not the behaviour under test.
 */

/**
 * Known, accepted issues per page. Format: `type @ selector — message`.
 *
 * **All three pages are currently at zero.** The four entries that used to live here were
 * real defects — an unlabelled search box, two unlabelled date-picker selects, a <label>
 * with no `for`, and a modal heading jumping h1 → h5. They were fixed at the source
 * (adrianjiga.github.io#12), and this file failed until they were removed, which is the
 * baseline mechanism working: an entry that stops occurring is itself an error.
 *
 * Adding an entry here is therefore a deliberate act. Do it only with a comment saying why
 * the issue is acceptable, and treat it as debt to remove rather than a permanent exception.
 */
const BASELINE = {
  buttons: [],
  webTables: [],
  registerForm: [],
};

test.describe("Accessibility", () => {
  test("buttons page has no accessibility issues @a11y", async ({ page }) => {
    const buttonsPage = new ButtonsPage(page);
    await buttonsPage.visit();

    const { issues, score } = await auditAccessibility(page);

    expectAccessibilityBaseline(issues, BASELINE.buttons);
    expect(score).toBe(100);
  });

  test("web tables page matches its accessibility baseline @a11y", async ({
    page,
  }) => {
    const webTablesPage = new WebTablesPage(page);
    await webTablesPage.visit();

    const { issues } = await auditAccessibility(page);

    expectAccessibilityBaseline(issues, BASELINE.webTables);
  });

  test("register form matches its accessibility baseline @a11y", async ({
    page,
  }) => {
    const registerFormPage = new RegisterFormPage(page);
    await registerFormPage.visit();

    const { issues } = await auditAccessibility(page);

    expectAccessibilityBaseline(issues, BASELINE.registerForm);
  });

  test("submitted-state register form reports no new issues @a11y", async ({
    page,
  }) => {
    // Auditing only the initial render misses whatever a page reveals at runtime — the
    // confirmation modal is hidden until submit, and it is where the heading-hierarchy
    // defect used to live.
    //
    // Date of birth is required for submission alongside first name, last name, mobile and
    // gender, and it cannot be typed — it must be picked. Omitting it leaves the form
    // blocked by validation and the modal shut.
    const registerFormPage = new RegisterFormPage(page);
    await registerFormPage.visit();
    await registerFormPage.fillCompleteForm({
      firstName: "Ada",
      lastName: "Lovelace",
      mobile: "1234567890",
      gender: "male",
      dateOfBirth: { month: "January", year: "1990", day: "01" },
    });
    await registerFormPage.submit();
    await registerFormPage.verifySubmissionSuccess();

    const { issues } = await auditAccessibility(page);

    expectAccessibilityBaseline(issues, BASELINE.registerForm);
  });
});
