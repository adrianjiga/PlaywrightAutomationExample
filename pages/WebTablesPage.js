/**
 * Page Object for Web Tables helper page
 * @see https://adrianjiga.github.io/qa/helpers/webtables/
 */
export class WebTablesPage {
  constructor(page) {
    this.page = page;
    this.url = "https://adrianjiga.github.io/qa/helpers/webtables/";

    this.searchBox = page.locator("#searchBox");
    this.addNewRecordButton = page.locator("#addNewRecordButton");
    this.tableBody = page.locator("#table-body");
    this.tableRow = page.locator("#table-body tr");
    this.tableRowActive = page.locator("#table-body tr");
    this.tableCell = page.locator("#table-body td");
    this.tableGroup = page.locator("#table-body tr");
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
    await this.tableRow.first().waitFor();
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
    return this.tableRowActive;
  }

  /**
   * Verify the number of visible rows
   * @param {number} count - Expected number of rows
   */
  async verifyRowCount(count) {
    const rows = await this.getVisibleRows();
    const rowCount = await rows.count();
    if (rowCount !== count) {
      throw new Error(`Expected ${count} rows, got ${rowCount}`);
    }
    return this;
  }

  /**
   * Verify row count is at least a certain number
   * @param {number} minCount - Minimum expected rows
   */
  async verifyMinRowCount(minCount) {
    const rows = await this.getVisibleRows();
    const rowCount = await rows.count();
    if (rowCount < minCount) {
      throw new Error(`Expected at least ${minCount} rows, got ${rowCount}`);
    }
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
   * @param {Object} data - Form data object
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
   * @param {Object} data - Expected data in the row
   */
  async verifyRecordExists(data) {
    const row = this.tableGroup.filter({ hasText: data.firstName });
    await row.waitFor({ state: "visible" });

    if (data.firstName) {
      const cell = row.locator("td").nth(0);
      const text = await cell.textContent();
      if (!text.includes(data.firstName)) {
        throw new Error(`First name "${data.firstName}" not found`);
      }
    }
    if (data.lastName) {
      const cell = row.locator("td").nth(1);
      const text = await cell.textContent();
      if (!text.includes(data.lastName)) {
        throw new Error(`Last name "${data.lastName}" not found`);
      }
    }
    if (data.age) {
      const cell = row.locator("td").nth(2);
      const text = await cell.textContent();
      if (!text.includes(data.age.toString())) {
        throw new Error(`Age "${data.age}" not found`);
      }
    }
    if (data.email) {
      const cell = row.locator("td").nth(3);
      const text = await cell.textContent();
      if (!text.includes(data.email)) {
        throw new Error(`Email "${data.email}" not found`);
      }
    }
    if (data.salary) {
      const cell = row.locator("td").nth(4);
      const text = await cell.textContent();
      if (!text.includes(data.salary.toString())) {
        throw new Error(`Salary "${data.salary}" not found`);
      }
    }
    if (data.department) {
      const cell = row.locator("td").nth(5);
      const text = await cell.textContent();
      if (!text.includes(data.department)) {
        throw new Error(`Department "${data.department}" not found`);
      }
    }
    return this;
  }

  /**
   * Verify record has edit and delete buttons
   * @param {string} identifier - Text to identify the row
   */
  async verifyRecordActions(identifier) {
    const row = this.tableGroup.filter({ hasText: identifier });
    const actionsCell = row.locator("td").nth(6);
    await actionsCell
      .locator('span[title="Edit"]')
      .waitFor({ state: "visible" });
    await actionsCell
      .locator('span[title="Delete"]')
      .waitFor({ state: "visible" });
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
    const text = await this.totalPages.textContent();
    if (!text.includes(expectedPages)) {
      throw new Error(`Expected "${expectedPages}" pages, got "${text}"`);
    }
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
    const isDisabled = await this.nextButton.isDisabled();
    if (isDisabled) {
      throw new Error("Next button should be enabled");
    }
    return this;
  }

  /**
   * Verify previous button is enabled
   */
  async verifyPreviousEnabled() {
    const isDisabled = await this.previousButton.isDisabled();
    if (isDisabled) {
      throw new Error("Previous button should be enabled");
    }
    return this;
  }

  /**
   * Get data from the first row
   * @returns {Promise<Object>}
   */
  async getFirstRowData() {
    const row = this.tableRowActive.first();
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
   * @returns {Promise<Object>}
   */
  async getRowData(index) {
    const row = this.tableRowActive.nth(index);
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
