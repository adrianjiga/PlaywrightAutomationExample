import { test, expect } from "@playwright/test";
import {
  API_CONFIG,
  BOOK_SCHEMA,
  validateBookSchema,
  validateResponse,
} from "../../utils/apiHelpers.js";
import book from "../fixtures/book.json" with { type: "json" };

test.describe("DemoQA Book Store API Tests", () => {
  test("should list all books with correct structure and data @api", async ({
    request,
  }) => {
    const response = await request.get(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.books}`,
      {
        headers: API_CONFIG.headers,
      }
    );

    await validateResponse(response, expect, 200);

    const body = await response.json();
    expect(body).toHaveProperty("books");
    expect(Array.isArray(body.books)).toBe(true);
    expect(body.books.length).toBeGreaterThan(0);

    for (const bookItem of body.books) {
      validateBookSchema(bookItem, expect);
    }

    const publishers = [...new Set(body.books.map((b) => b.publisher))];
    expect(publishers.sort()).toEqual(
      BOOK_SCHEMA.publisher.allowedValues.sort()
    );
  });

  test("should fetch a specific book by valid ISBN @api", async ({
    request,
  }) => {
    const response = await request.get(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.book}`,
      {
        headers: API_CONFIG.headers,
        params: { ISBN: book.isbn },
      }
    );

    await validateResponse(response, expect, 200);

    const body = await response.json();
    expect(body.isbn).toBe(book.isbn);
    expect(body.title).toBe(book.title);
    expect(body.subTitle).toBe(book.subTitle);
    expect(body.author).toBe(book.author);
    expect(body.publisher).toBe(book.publisher);
    expect(body.pages).toBe(book.pages);

    validateBookSchema(body, expect);
  });

  test("should handle invalid ISBN with proper error response @api", async ({
    request,
  }) => {
    const response = await request.get(
      `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.book}`,
      {
        headers: API_CONFIG.headers,
        params: { ISBN: "invalid-isbn" },
      }
    );

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toHaveProperty("message");
    expect(typeof body.message).toBe("string");
  });
});

test.describe("API Testing with JSONPlaceholder", () => {
  test("fetches todo item successfully @api", async ({ request }) => {
    const response = await request.get(
      "https://jsonplaceholder.typicode.com/todos/1"
    );

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.userId).toBe(1);
    expect(body.id).toBe(1);
    expect(body.title).toBe("delectus aut autem");
    expect(body.completed).toBe(false);
  });

  test("creates a new post @api", async ({ request }) => {
    const newPost = {
      title: "Test Post",
      body: "This is a test post",
      userId: 1,
    };

    const response = await request.post(
      "https://jsonplaceholder.typicode.com/posts",
      {
        data: newPost,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.title).toBe(newPost.title);
    expect(body.body).toBe(newPost.body);
    expect(body.userId).toBe(newPost.userId);
    expect(body).toHaveProperty("id");
  });

  test("updates an existing post @api", async ({ request }) => {
    const updatedPost = {
      id: 1,
      title: "Updated Title",
      body: "Updated body content",
      userId: 1,
    };

    const response = await request.put(
      "https://jsonplaceholder.typicode.com/posts/1",
      {
        data: updatedPost,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.title).toBe(updatedPost.title);
    expect(body.body).toBe(updatedPost.body);
  });

  test("deletes a post @api", async ({ request }) => {
    const response = await request.delete(
      "https://jsonplaceholder.typicode.com/posts/1"
    );

    expect(response.status()).toBe(200);
  });
});
