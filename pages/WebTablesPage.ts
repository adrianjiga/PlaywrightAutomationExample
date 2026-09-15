import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

export interface WebTableRecord {
  firstName?: string;
  lastName?: string;
  email?: string;
  age?: string | number;
  salary?: string | number;
  department?: string;
}

// Values come from `textContent()` and may be null if the cell is empty.
export interface WebTableRow {
  firstName: string | null;
  lastName: string | null;
  age: string | null;
  email: string | null;
  salary: string | null;
  department: string | null;
}

export class WebTablesPage {
  readonly page: Page;
  readonly url: string;

  readonly searchBox: Locator;
  readonly addNewRecordButton: Locator;
  readonly rows: Locator;
  readonly modal: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly ageInput: Locator;
  readonly salaryInput: Locator;
  readonly departmentInput: Locator;
  readonly submitButton: Locator;
  readonly rowsPerPageSelect: Locator;
  readonly totalPages: Locator;
  readonly nextButton: Locator;
  readonly previousButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.url = "https://adrianjiga.github.io/qa/helpers/webtables/";

    this.searchBox = page.locator('[data-cy="searchBox"]');
    this.addNewRecordButton = page.locator('[data-cy="addRecordBtn"]');
    this.rows = page.locator('[data-cy="tableBody"] tr');
    this.modal = page.locator('[data-cy="registrationModal"]');
    this.firstNameInput = page.locator('[data-cy="modalFirstName"]');
    this.lastNameInput = page.locator('[data-cy="modalLastName"]');
    this.emailInput = page.locator('[data-cy="modalEmail"]');
    this.ageInput = page.locator('[data-cy="modalAge"]');
    this.salaryInput = page.locator('[data-cy="modalSalary"]');
    this.departmentInput = page.locator('[data-cy="modalDepartment"]');
    this.submitButton = page.locator('[data-cy="modalSubmitBtn"]');
    this.rowsPerPageSelect = page.locator('[data-cy="rowsPerPageSelect"]');
    this.totalPages = page.locator('[data-cy="totalPages"]');
    this.nextButton = page.locator('[data-cy="nextPageBtn"]');
    this.previousButton = page.locator('[data-cy="prevPageBtn"]');
  }

  // The helper persists records in localStorage, so clear it to start each visit clean.
  async visit() {
    await this.page.goto(this.url);
    await this.page.evaluate(() => localStorage.clear());
    await this.page.reload();
    await this.rows.first().waitFor();
    return this;
  }

  async search(searchText: string) {
    await this.searchBox.clear();
    await this.searchBox.fill(searchText);
    return this;
  }

  async clearSearch() {
    await this.searchBox.clear();
    return this;
  }

  async getVisibleRows(): Promise<Locator> {
    return this.rows;
  }

  async verifyRowCount(count: number) {
    await expect(this.rows).toHaveCount(count);
    return this;
  }

  async verifyMinRowCount(minCount: number) {
    await expect.poll(() => this.rows.count()).toBeGreaterThanOrEqual(minCount);
    return this;
  }

  async openAddModal() {
    await this.addNewRecordButton.click();
    await this.modal.waitFor({ state: "visible" });
    return this;
  }

  async openEditModal(recordId: number) {
    await this.page.locator(`[data-cy="editBtn${recordId}"]`).click();
    await this.modal.waitFor({ state: "visible" });
    return this;
  }

  async deleteRecord(recordId: number) {
    await this.page.locator(`[data-cy="deleteBtn${recordId}"]`).click();
    return this;
  }

  async fillForm(data: WebTableRecord) {
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

  async submitForm() {
    await this.submitButton.click();
    await this.modal.waitFor({ state: "hidden" });
    return this;
  }

  async verifyRecordExists(data: WebTableRecord) {
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

  async verifyRecordActions(identifier: string) {
    const actionsCell = this.rows
      .filter({ hasText: identifier })
      .locator("td")
      .nth(6);
    await expect(actionsCell.locator('span[title="Edit"]')).toBeVisible();
    await expect(actionsCell.locator('span[title="Delete"]')).toBeVisible();
    return this;
  }

  async setRowsPerPage(rowsPerPage: number) {
    await this.rowsPerPageSelect.selectOption(`${rowsPerPage}`);
    return this;
  }

  async verifyTotalPages(expectedPages: string) {
    await expect(this.totalPages).toContainText(expectedPages);
    return this;
  }

  async goToNextPage() {
    await this.nextButton.click();
    return this;
  }

  async goToPreviousPage() {
    await this.previousButton.click();
    return this;
  }

  async verifyNextEnabled() {
    await expect(this.nextButton).toBeEnabled();
    return this;
  }

  async verifyPreviousEnabled() {
    await expect(this.previousButton).toBeEnabled();
    return this;
  }

  async getFirstRowData(): Promise<WebTableRow> {
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

  async getRowData(index: number): Promise<WebTableRow> {
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
