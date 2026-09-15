import { test, expect } from "@playwright/test";

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
