import { expect } from "@playwright/test";

/**
 * @typedef {Object} WebTableRecord
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {string} [email]
 * @property {string|number} [age]
 * @property {string|number} [salary]
 * @property {string} [department]
 */

/**
 * Row data read back from the rendered table — values come from `textContent()`
 * and may be `null` if the cell is empty.
 * @typedef {Object} WebTableRow
 * @property {string|null} firstName
 * @property {string|null} lastName
 * @property {string|null} age
 * @property {string|null} email
 * @property {string|null} salary
 * @property {string|null} department
 */

/**
 * Page Object for Web Tables helper page
 * @see https://adrianjiga.github.io/qa/helpers/webtables/
 */
export class WebTablesPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.url = "https://adrianjiga.github.io/qa/helpers/webtables/";

    this.searchBox = page.locator("#searchBox");
    this.addNewRecordButton = page.locator("#addNewRecordButton");
    this.rows = page.locator("#table-body tr");
    this.modal = page.locator('[data-cy="registration-modal"]');
    this.modalTitle = page.locator("#registration-form-modal");
    this.firstNameInput = page.locator("#firstName");
    this.lastNameInput = page.locator("#lastName");
    this.emailInput = page.locator("#userEmail");
    this.ageInput = page.locator("#age");
    this.salaryInput = page.locator("#salary");
    this.departmentInput = page.locator("#department");
    this.submitButton = page.locator("#submit");
    this.rowsPerPageSelect = page.locator('select[aria-label="rows per page"]');
    this.totalPages = page.locator(".-totalPages");
    this.nextButton = page.locator('[data-cy="next-page-btn"]');
    this.previousButton = page.locator('[data-cy="prev-page-btn"]');
  }

  /**
   * Navigate to the Web Tables page and reset persisted state
   */
  async visit() {
    await this.page.goto(this.url);
    await this.page.evaluate(() => localStorage.clear());
    await this.page.reload();
    await this.rows.first().waitFor();
    return this;
  }

  /**
   * Search for a record in the table
   * @param {string} searchText - Text to search for
   */
  async search(searchText) {
    await this.searchBox.clear();
    await this.searchBox.fill(searchText);
    return this;
  }

  /**
   * Clear the search box
   */
  async clearSearch() {
    await this.searchBox.clear();
    return this;
  }

  /**
   * Get all visible (non-empty) rows
   */
  async getVisibleRows() {
    return this.rows;
  }

  /**
   * Verify the number of visible rows
   * @param {number} count - Expected number of rows
   */
  async verifyRowCount(count) {
    await expect(this.rows).toHaveCount(count);
    return this;
  }

  /**
   * Verify row count is at least a certain number
   * @param {number} minCount - Minimum expected rows
   */
  async verifyMinRowCount(minCount) {
    await expect.poll(() => this.rows.count()).toBeGreaterThanOrEqual(minCount);
    return this;
  }

  /**
   * Click the Add New Record button and wait for modal
   */
  async openAddModal() {
    await this.addNewRecordButton.click();
    await this.modal.waitFor({ state: "visible" });
    return this;
  }

  /**
   * Click the edit button for a specific row position (1-based)
   * @param {number} recordId - Row position to edit
   */
  async openEditModal(recordId) {
    await this.page.locator(`#edit-record-${recordId}`).click();
    await this.modal.waitFor({ state: "visible" });
    return this;
  }

  /**
   * Delete a specific row by position (1-based)
   * @param {number} recordId - Row position to delete
   */
  async deleteRecord(recordId) {
    await this.page.locator(`#delete-record-${recordId}`).click();
    return this;
  }

  /**
   * Fill the registration/edit form
   * @param {WebTableRecord} data - Form data object
   */
  async fillForm(data) {
    if (data.firstName) {
      await this.firstNameInput.clear();
      await this.firstNameInput.fill(data.firstName);
    }
    if (data.lastName) {
      await this.lastNameInput.clear();
      await this.lastNameInput.fill(data.lastName);
    }
    if (data.email) {
      await this.emailInput.clear();
      await this.emailInput.fill(data.email);
    }
    if (data.age) {
      await this.ageInput.clear();
      await this.ageInput.fill(data.age.toString());
    }
    if (data.salary) {
      await this.salaryInput.clear();
      await this.salaryInput.fill(data.salary.toString());
    }
    if (data.department) {
      await this.departmentInput.clear();
      await this.departmentInput.fill(data.department);
    }
    return this;
  }

  /**
   * Submit the form and wait for modal to close
   */
  async submitForm() {
    await this.submitButton.click();
    await this.modal.waitFor({ state: "hidden" });
    return this;
  }

  /**
   * Verify a record exists with specific data
   * @param {WebTableRecord} data - Expected data in the row
   */
  async verifyRecordExists(data) {
    const row = this.rows.filter({ hasText: data.firstName });
    await expect(row).toBeVisible();

    const cells = [
      data.firstName,
      data.lastName,
      data.age?.toString(),
      data.email,
      data.salary?.toString(),
      data.department,
    ];
    for (const [index, expected] of cells.entries()) {
      if (expected !== undefined) {
        await expect(row.locator("td").nth(index)).toContainText(expected);
      }
    }
    return this;
  }

  /**
   * Verify record has edit and delete buttons
   * @param {string} identifier - Text to identify the row
   */
  async verifyRecordActions(identifier) {
    const actionsCell = this.rows
      .filter({ hasText: identifier })
      .locator("td")
      .nth(6);
    await expect(actionsCell.locator('span[title="Edit"]')).toBeVisible();
    await expect(actionsCell.locator('span[title="Delete"]')).toBeVisible();
    return this;
  }

  /**
   * Change the number of rows displayed per page
   * @param {number} rowsPerPage - Number of rows (5, 10, 20, 25, 50, 100)
   */
  async setRowsPerPage(rowsPerPage) {
    await this.rowsPerPageSelect.selectOption(`${rowsPerPage}`);
    return this;
  }

  /**
   * Verify the total number of pages
   * @param {string} expectedPages - Expected page count as string
   */
  async verifyTotalPages(expectedPages) {
    await expect(this.totalPages).toContainText(expectedPages);
    return this;
  }

  /**
   * Navigate to next page
   */
  async goToNextPage() {
    await this.nextButton.click();
    return this;
  }

  /**
   * Navigate to previous page
   */
  async goToPreviousPage() {
    await this.previousButton.click();
    return this;
  }

  /**
   * Verify next button is enabled
   */
  async verifyNextEnabled() {
    await expect(this.nextButton).toBeEnabled();
    return this;
  }

  /**
   * Verify previous button is enabled
   */
  async verifyPreviousEnabled() {
    await expect(this.previousButton).toBeEnabled();
    return this;
  }

  /**
   * Get data from the first row
   * @returns {Promise<WebTableRow>}
   */
  async getFirstRowData() {
    const row = this.rows.first();
    return {
      firstName: await row.locator("td").nth(0).textContent(),
      lastName: await row.locator("td").nth(1).textContent(),
      age: await row.locator("td").nth(2).textContent(),
      email: await row.locator("td").nth(3).textContent(),
      salary: await row.locator("td").nth(4).textContent(),
      department: await row.locator("td").nth(5).textContent(),
    };
  }

  /**
   * Get data from a specific row by index
   * @param {number} index - Row index (0-based)
   * @returns {Promise<WebTableRow>}
   */
  async getRowData(index) {
    const row = this.rows.nth(index);
    return {
      firstName: await row.locator("td").nth(0).textContent(),
      lastName: await row.locator("td").nth(1).textContent(),
      age: await row.locator("td").nth(2).textContent(),
      email: await row.locator("td").nth(3).textContent(),
      salary: await row.locator("td").nth(4).textContent(),
      department: await row.locator("td").nth(5).textContent(),
    };
  }
}
