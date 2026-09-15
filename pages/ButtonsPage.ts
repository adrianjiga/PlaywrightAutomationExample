import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

export class ButtonsPage {
  readonly page: Page;
  readonly url: string;

  readonly doubleClickButton: Locator;
  readonly rightClickButton: Locator;
  readonly dynamicClickButton: Locator;
  readonly doubleClickMessage: Locator;
  readonly rightClickMessage: Locator;
  readonly dynamicClickMessage: Locator;

  static messages = {
    doubleClick: "You have done a double click",
    rightClick: "You have done a right click",
    dynamicClick: "You have done a dynamic click",
  };

  constructor(page: Page) {
    this.page = page;
    this.url = "https://adrianjiga.github.io/qa/helpers/buttons/";

    this.doubleClickButton = page.locator('[data-cy="doubleClickBtn"]');
    this.rightClickButton = page.locator('[data-cy="rightClickBtn"]');
    this.dynamicClickButton = page.locator('[data-cy="dynamicClickBtn"]');
    this.doubleClickMessage = page.locator('[data-cy="doubleClickMessage"]');
    this.rightClickMessage = page.locator('[data-cy="rightClickMessage"]');
    this.dynamicClickMessage = page.locator('[data-cy="dynamicClickMessage"]');
  }

  async visit() {
    await this.page.goto(this.url);
    return this;
  }

  async performDoubleClick() {
    await this.doubleClickButton.dblclick();
    return this;
  }

  async performRightClick() {
    await this.rightClickButton.click({ button: "right" });
    return this;
  }

  async performDynamicClick() {
    await this.dynamicClickButton.click();
    return this;
  }

  async verifyDoubleClickMessage() {
    await expect(this.doubleClickMessage).toContainText(
      ButtonsPage.messages.doubleClick
    );
    return this;
  }

  async verifyRightClickMessage() {
    await expect(this.rightClickMessage).toContainText(
      ButtonsPage.messages.rightClick
    );
    return this;
  }

  async verifyDynamicClickMessage() {
    await expect(this.dynamicClickMessage).toContainText(
      ButtonsPage.messages.dynamicClick
    );
    return this;
  }
}
