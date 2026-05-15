import { test } from "@playwright/test";
import { ButtonsPage } from "../../pages/index.js";

test.describe("Buttons", () => {
  /** @type {ButtonsPage} */
  let buttonsPage;

  test.beforeEach(async ({ page }) => {
    buttonsPage = new ButtonsPage(page);
    await buttonsPage.visit();
  });

  test("should interact with double click button @ui @smoke", async () => {
    await buttonsPage.performDoubleClick();
    await buttonsPage.verifyDoubleClickMessage();
  });

  test("should interact with right click button @ui", async () => {
    await buttonsPage.performRightClick();
    await buttonsPage.verifyRightClickMessage();
  });

  test("should interact with dynamic button @ui", async () => {
    await buttonsPage.performDynamicClick();
    await buttonsPage.verifyDynamicClickMessage();
  });
});
