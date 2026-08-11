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

/** Known, accepted issues per page. Format: `type @ selector — message`. */
const BASELINE = {
  // Nothing wrong. Held at zero.
  buttons: [],

  // The table's search box is an unlabelled <input>. It has a placeholder, which screen
  // readers do not reliably announce as a label.
  webTables: [
    "Form Accessibility @ input#searchBox — 1 form inputs without labels",
  ],

  registerForm: [
    // The custom date picker's month/year <select>s and the subjects input carry no label
    // or aria-label.
    "Form Accessibility @ select#dp-month — 3 form inputs without labels",
    // The success modal opens with an <h5> under an <h1> page heading, skipping h2–h4.
    "Heading Hierarchy @ div#success-modal > div.modal-dialog > div.modal-content > div.modal-header:nth-of-type(1) > h5 — Heading levels are not in proper order",
  ],
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
    // Auditing only the initial render misses everything a page builds at runtime. The
    // confirmation modal is injected on submit, so it is invisible to a load-time audit —
    // and it is exactly where the heading-hierarchy defect lives.
    const registerFormPage = new RegisterFormPage(page);
    await registerFormPage.visit();
    await registerFormPage.fillCompleteForm({
      firstName: "Ada",
      lastName: "Lovelace",
      mobile: "1234567890",
      gender: "male",
    });
    await registerFormPage.submit();
    await registerFormPage.verifySubmissionSuccess();

    const { issues } = await auditAccessibility(page);

    expectAccessibilityBaseline(issues, BASELINE.registerForm);
  });
});
