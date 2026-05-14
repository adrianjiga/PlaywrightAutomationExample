/**
 * Page Object for Buttons helper page
 * @see https://adrianjiga.github.io/qa/helpers/buttons/
 */
export class ButtonsPage {
  constructor(page) {
    this.page = page;
    this.url = "https://adrianjiga.github.io/qa/helpers/buttons/";

    this.doubleClickButton = page.locator("#doubleClickBtn");
    this.rightClickButton = page.locator("#rightClickBtn");
    this.dynamicClickButton = page.locator('[data-cy="dynamic-click-btn"]');
    this.doubleClickMessage = page.locator("#doubleClickMessage");
    this.rightClickMessage = page.locator("#rightClickMessage");
    this.dynamicClickMessage = page.locator("#dynamicClickMessage");
  }

  static messages = {
    doubleClick: "You have done a double click",
    rightClick: "You have done a right click",
    dynamicClick: "You have done a dynamic click",
  };

  /**
   * Navigate to the Buttons page
   */
  async visit() {
    await this.page.goto(this.url);
    return this;
  }

  /**
   * Perform double click on the double click button
   */
  async performDoubleClick() {
    await this.doubleClickButton.dblclick();
    return this;
  }

  /**
   * Perform right click on the right click button
   */
  async performRightClick() {
    await this.rightClickButton.click({ button: "right" });
    return this;
  }

  /**
   * Perform dynamic click on the dynamic button
   */
  async performDynamicClick() {
    await this.dynamicClickButton.click();
    return this;
  }

  /**
   * Verify double click message is displayed
   */
  async verifyDoubleClickMessage() {
    await this.doubleClickMessage.waitFor({ state: "visible" });
    const text = await this.doubleClickMessage.textContent();
    if (!text.includes(ButtonsPage.messages.doubleClick)) {
      throw new Error(
        `Expected message "${ButtonsPage.messages.doubleClick}" not found`
      );
    }
    return this;
  }

  /**
   * Verify right click message is displayed
   */
  async verifyRightClickMessage() {
    await this.rightClickMessage.waitFor({ state: "visible" });
    const text = await this.rightClickMessage.textContent();
    if (!text.includes(ButtonsPage.messages.rightClick)) {
      throw new Error(
        `Expected message "${ButtonsPage.messages.rightClick}" not found`
      );
    }
    return this;
  }

  /**
   * Verify dynamic click message is displayed
   */
  async verifyDynamicClickMessage() {
    await this.dynamicClickMessage.waitFor({ state: "visible" });
    const text = await this.dynamicClickMessage.textContent();
    if (!text.includes(ButtonsPage.messages.dynamicClick)) {
      throw new Error(
        `Expected message "${ButtonsPage.messages.dynamicClick}" not found`
      );
    }
    return this;
  }
}
