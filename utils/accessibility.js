import { createRequire } from "node:module";
import { expect } from "@playwright/test";

/**
 * `require.resolve` does not exist in an ES module, and this project is `"type": "module"` —
 * hence `createRequire`. Resolving rather than hardcoding a path means npm decides where the
 * package lives, so a hoisted or nested install both work.
 */
const require = createRequire(import.meta.url);
const ANALYZER_BUNDLE = require.resolve("webqualityanalyzer/wqa.js");

/**
 * @typedef {Object} A11yIssue
 * @property {string} type - e.g. "Form Accessibility"
 * @property {string} message
 * @property {'high'|'medium'|'low'} severity
 * @property {string} [selector] - CSS path to the first offending element
 * @property {string} [htmlSnippet]
 */

/**
 * Injects the analyzer into the page and returns its accessibility findings.
 *
 * SEO and performance are switched off deliberately. They audit the *page*, not the
 * behaviour under test, and their findings (a missing meta description, an unminified
 * script) are not defects of a QA helper fixture — including them would make this suite fail
 * over things it has no opinion about.
 *
 * The analyzer comes from the WebQualityAnalyzer project, which ships the same engine that
 * drives its browser extension. It is a plain IIFE assigning `window.WebQualityAnalyzer`, so
 * there is no import to resolve inside the page.
 *
 * @param {import('@playwright/test').Page} page
 * @returns {Promise<{ score: number, issues: A11yIssue[], suggestions: string[] }>}
 */
export async function auditAccessibility(page) {
  await page.addScriptTag({ path: ANALYZER_BUNDLE });
  return page.evaluate(
    () =>
      window.WebQualityAnalyzer.analyzePage({
        seo: { enabled: false },
        performance: { enabled: false },
      }).categories.accessibility
  );
}

/** Full-fidelity identity for an issue: any change to type, location, or count is a change. */
function fingerprint(issue) {
  return `${issue.type} @ ${issue.selector ?? "(page)"} — ${issue.message}`;
}

/**
 * Asserts the page's accessibility findings match `baseline` exactly.
 *
 * This is a two-way check, and the second direction is the important one:
 *
 * 1. An issue **not** in the baseline fails — a new accessibility regression.
 * 2. A baseline entry that **no longer occurs** also fails — the debt was paid, so the
 *    entry must go.
 *
 * Without (2) a baseline is just a suppression list: it only ever grows, and nothing ever
 * tells you an entry became obsolete. With it, fixing the page *forces* the baseline to
 * shrink, so the file stays an accurate record of known debt rather than a graveyard.
 *
 * A page with no known issues passes `[]` and is held at zero from then on.
 *
 * @param {A11yIssue[]} issues - what the analyzer found
 * @param {string[]} baseline - fingerprints of accepted, documented issues
 */
export function expectAccessibilityBaseline(issues, baseline) {
  const found = issues.map(fingerprint);

  const regressions = found.filter((f) => !baseline.includes(f));
  expect(
    regressions,
    `New accessibility issue(s) not in the baseline. Fix the page, or — if this is genuinely ` +
      `acceptable — add the exact string(s) to the baseline with a comment explaining why:\n` +
      regressions.map((r) => `  ${r}`).join("\n")
  ).toEqual([]);

  const resolved = baseline.filter((b) => !found.includes(b));
  expect(
    resolved,
    `Baseline entr(ies) no longer reported — the page was fixed. Remove them so the baseline ` +
      `keeps reflecting reality:\n` +
      resolved.map((r) => `  ${r}`).join("\n")
  ).toEqual([]);
}
