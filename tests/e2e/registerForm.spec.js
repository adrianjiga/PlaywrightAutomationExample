import { test } from "@playwright/test";
import { RegisterFormPage } from "../../pages/index.js";
import { userFactory } from "../../utils/factories.js";
import path from "path";

test.describe("Register Form", () => {
  /** @type {RegisterFormPage} */
  let registerFormPage;

  test.beforeEach(async ({ page }) => {
    registerFormPage = new RegisterFormPage(page);
    await registerFormPage.visit();
  });

  test("should submit the practice form with all fields @ui", async () => {
    const testUser = userFactory.generateFormUser();
    const fixturePath = path.join(
      process.cwd(),
      "tests/fixtures/sample-upload.json"
    );

    await registerFormPage.fillCompleteForm({
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      email: testUser.email,
      mobile: testUser.mobile,
      address: testUser.address,
      gender: "male",
      dateOfBirth: { month: "January", year: "1990", day: "01" },
      subjects: ["Maths"],
      hobbies: ["sports", "reading"],
      picture: fixturePath,
      state: 0,
      city: 0,
    });

    await registerFormPage.submit();
    await registerFormPage.verifySubmissionSuccess();

    const expectedData = {
      "Student Name": `${testUser.firstName} ${testUser.lastName}`,
      "Student Email": testUser.email,
      Gender: "Male",
      Mobile: testUser.mobile,
      "Date of Birth": "01 January,1990",
      Subjects: "Maths",
      Hobbies: "Sports, Reading",
      Picture: "sample-upload.json",
      Address: testUser.address,
      "State and City": "Germany Berlin",
    };

    await registerFormPage.verifySubmittedData(expectedData);
    await registerFormPage.closeModal();
  });

  test("should show validation errors for required fields @ui", async () => {
    await registerFormPage.submit();
    await registerFormPage.verifyRequiredFieldErrors();
  });
});
