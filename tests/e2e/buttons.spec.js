import { test, expect } from "@playwright/test";
import { ButtonsPage } from "../../pages/index.js";

test.describe("Buttons", () => {
  let buttonsPage;

  test.beforeEach(async ({ page }) => {
    buttonsPage = new ButtonsPage(page);
    await buttonsPage.visit();
  });

  test("should interact with double click button @ui @smoke", async () => {
    await buttonsPage.performDoubleClick();
    await buttonsPage.verifyDoubleClickMessage();

    await expect(buttonsPage.doubleClickMessage).toContainText(
      ButtonsPage.messages.doubleClick
    );
  });

  test("should interact with right click button @ui", async () => {
    await buttonsPage.performRightClick();
    await buttonsPage.verifyRightClickMessage();

    await expect(buttonsPage.rightClickMessage).toContainText(
      ButtonsPage.messages.rightClick
    );
  });

  test("should interact with dynamic button @ui", async () => {
    await buttonsPage.performDynamicClick();
    await buttonsPage.verifyDynamicClickMessage();

    await expect(buttonsPage.dynamicClickMessage).toContainText(
      ButtonsPage.messages.dynamicClick
    );
  });
});
