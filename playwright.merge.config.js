/* eslint-disable no-undef */
import { defineConfig } from "@playwright/test";

export default defineConfig({
  reporter: [
    ["html", { outputFolder: "reports/final", open: "never" }],
    ["@estruyf/github-actions-reporter", { useDetails: true, showError: true }],
  ],
});
