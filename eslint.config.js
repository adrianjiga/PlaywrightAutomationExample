import js from "@eslint/js";
import globals from "globals";
import prettier from "eslint-config-prettier";
import playwright from "eslint-plugin-playwright";

export default [
  js.configs.recommended,
  {
    files: ["tests/**/*.js", "pages/**/*.js", "utils/**/*.js"],
    ...playwright.configs["flat/recommended"],
    languageOptions: {
      parserOptions: {
        sourceType: "module",
        ecmaVersion: "latest",
      },
      globals: {
        ...Object.fromEntries(
          Object.entries(globals.browser).map(([key]) => [key, "readonly"])
        ),
        ...Object.fromEntries(
          Object.entries(globals.node).map(([key]) => [key, "readonly"])
        ),
        ...Object.fromEntries(
          Object.entries(globals.es2021).map(([key]) => [key, "readonly"])
        ),
      },
    },
    plugins: {
      playwright: playwright,
    },
    rules: {
      ...playwright.configs["flat/recommended"].rules,
      semi: ["error", "always"],
      quotes: ["error", "double"],
      indent: ["error", 2],
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-multi-spaces": "error",
      "no-trailing-spaces": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-var": "error",
      "playwright/no-conditional-in-test": "warn",
      "playwright/no-focused-test": "error",
      "playwright/no-skipped-test": "warn",
      "playwright/valid-expect": "error",
      "playwright/expect-expect": [
        "warn",
        { assertFunctionPatterns: ["^verify"] },
      ],
    },
  },
  prettier,
];
