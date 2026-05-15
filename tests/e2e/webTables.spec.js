import { test, expect } from "@playwright/test";
import { WebTablesPage } from "../../pages/index.js";
import { userFactory } from "../../utils/factories.js";

test.describe("WebTables", () => {
  /** @type {WebTablesPage} */
  let webTablesPage;

  test.beforeEach(async ({ page }) => {
    webTablesPage = new WebTablesPage(page);
    await webTablesPage.visit();
  });

  test("search for a record @webTables", async () => {
    await webTablesPage.search("Cierra");

    const row = webTablesPage.rows.filter({ hasText: "Cierra" });
    await expect(row.first()).toBeVisible();
    await webTablesPage.verifyRowCount(1);
    await webTablesPage.clearSearch();
    await webTablesPage.verifyMinRowCount(2);
  });

  test("edit an existing record @webTables", async () => {
    const newAge = userFactory.generateAge();
    const newDepartment = "Engineering";

    await webTablesPage.openEditModal(1);
    await webTablesPage.fillForm({
      age: newAge.toString(),
      department: newDepartment,
    });
    await webTablesPage.submitForm();

    const row = webTablesPage.rows.filter({ hasText: "Cierra" });
    const ageCell = row.locator("td").nth(2);
    const departmentCell = row.locator("td").nth(5);

    await expect(ageCell).toContainText(newAge.toString());
    await expect(departmentCell).toContainText(newDepartment);
  });

  test("add a new record @webTables", async () => {
    const newUser = userFactory.generate({ department: "Engineering" });

    await webTablesPage.openAddModal();
    await webTablesPage.fillForm(newUser);
    await webTablesPage.submitForm();

    await webTablesPage.verifyRecordExists(newUser);
    await webTablesPage.verifyRecordActions(newUser.firstName);
  });

  test("delete an existing record @webTables", async () => {
    const initialRows = await webTablesPage.getVisibleRows();
    const initialRowCount = await initialRows.count();

    const secondRecordData = await webTablesPage.getRowData(1);

    await webTablesPage.deleteRecord(1);

    const rowsAfterDelete = await webTablesPage.getVisibleRows();
    await expect(rowsAfterDelete).toHaveCount(initialRowCount - 1);

    const firstRowData = await webTablesPage.getFirstRowData();
    expect(firstRowData.firstName).toBe(secondRecordData.firstName);
    expect(firstRowData.lastName).toBe(secondRecordData.lastName);
    expect(firstRowData.age).toBe(secondRecordData.age);
    expect(firstRowData.email).toBe(secondRecordData.email);
    expect(firstRowData.salary).toBe(secondRecordData.salary);
    expect(firstRowData.department).toBe(secondRecordData.department);
  });

  test("change the number of rows displayed @webTables", async () => {
    const rowsPerPageOptions = [5, 10, 20, 25, 50, 100];

    for (const rowsPerPage of rowsPerPageOptions) {
      await webTablesPage.setRowsPerPage(rowsPerPage);
      const count = await webTablesPage.rows.count();
      expect(count).toBeLessThanOrEqual(rowsPerPage);
      await webTablesPage.verifyTotalPages("1");
    }
  });

  test("pagination when more than 5 records exist @webTables", async () => {
    // Add 3 more users
    for (let i = 0; i < 3; i++) {
      const user = userFactory.generate({
        firstName: `User${i}`,
        lastName: "Test",
      });
      await webTablesPage.openAddModal();
      await webTablesPage.fillForm(user);
      await webTablesPage.submitForm();
    }

    await webTablesPage.setRowsPerPage(5);
    await webTablesPage.verifyTotalPages("2");

    await webTablesPage.goToNextPage();
    const count = await webTablesPage.rows.count();
    expect(count).toBeGreaterThanOrEqual(1);

    const user2Row = webTablesPage.rows.filter({ hasText: "User2" });
    await expect(user2Row.first()).toBeVisible();

    await webTablesPage.verifyPreviousEnabled();
    await webTablesPage.goToPreviousPage();

    const cierraRow = webTablesPage.rows.filter({ hasText: "Cierra" });
    await expect(cierraRow.first()).toBeVisible();
    await webTablesPage.verifyNextEnabled();
  });
});
