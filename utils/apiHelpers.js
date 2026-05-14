/**
 * API Helper utilities for Playwright tests
 */

/**
 * API Configuration
 */
export const API_CONFIG = {
  baseUrl: "https://demoqa.com/BookStore/v1",
  endpoints: {
    books: "/Books",
    book: "/Book",
  },
  headers: {
    accept: "application/json",
    "Content-Type": "application/json",
  },
};

/**
 * Book schema for validation
 */
export const BOOK_SCHEMA = {
  isbn: { type: "string", pattern: /^[0-9-]+$/ },
  title: { type: "string" },
  subTitle: { type: "string" },
  author: { type: "string" },
  publish_date: { type: "string", isDate: true },
  publisher: {
    type: "string",
    allowedValues: ["O'Reilly Media", "No Starch Press"],
  },
  pages: { type: "number", min: 1 },
  description: { type: "string" },
  website: { type: "string" },
};

/**
 * Validate a book object against the schema
 * @param {Object} book - Book object to validate
 * @param {import('@playwright/test').expect} expect - Playwright expect
 */
export function validateBookSchema(book, expect) {
  Object.entries(BOOK_SCHEMA).forEach(([key, rules]) => {
    expect(book).toHaveProperty(key);
    expect(typeof book[key]).toBe(rules.type);

    if (rules.pattern) {
      expect(book[key]).toMatch(rules.pattern);
    }
    if (rules.isDate) {
      expect(new Date(book[key])).toBeInstanceOf(Date);
    }
    if (rules.min) {
      expect(book[key]).toBeGreaterThanOrEqual(rules.min);
    }
  });
}

/**
 * Make an API request with default configuration
 * @param {import('@playwright/test').APIRequestContext} request - Playwright request context
 * @param {string} method - HTTP method
 * @param {string} endpoint - API endpoint
 * @param {Object} options - Additional options
 * @returns {Promise<import('@playwright/test').APIResponse>}
 */
export async function apiRequest(request, method, endpoint, options = {}) {
  const url = `${API_CONFIG.baseUrl}${endpoint}`;
  const headers = { ...API_CONFIG.headers, ...options.headers };

  const requestOptions = {
    headers,
    ...options,
  };

  switch (method.toUpperCase()) {
    case "GET":
      return request.get(url, requestOptions);
    case "POST":
      return request.post(url, requestOptions);
    case "PUT":
      return request.put(url, requestOptions);
    case "DELETE":
      return request.delete(url, requestOptions);
    case "PATCH":
      return request.patch(url, requestOptions);
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }
}

/**
 * Validate response status and content type
 * @param {import('@playwright/test').APIResponse} response - API response
 * @param {import('@playwright/test').expect} expect - Playwright expect
 * @param {number} expectedStatus - Expected HTTP status code
 */
export async function validateResponse(response, expect, expectedStatus = 200) {
  expect(response.status()).toBe(expectedStatus);
  const contentType = response.headers()["content-type"];
  expect(contentType).toContain("application/json");
}
