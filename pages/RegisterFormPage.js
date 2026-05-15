import { expect } from "@playwright/test";

/**
 * Page Object for Automation Practice Form helper page
 * @see https://adrianjiga.github.io/qa/helpers/automation-practice-form/
 */
export class RegisterFormPage {
  constructor(page) {
    this.page = page;
    this.url =
      "https://adrianjiga.github.io/qa/helpers/automation-practice-form/";

    this.firstName = page.locator("#firstName");
    this.lastName = page.locator("#lastName");
    this.email = page.locator("#userEmail");
    this.mobile = page.locator("#userNumber");
    this.genderMaleLabel = page.locator('label[for="gender-radio-1"]');
    this.genderFemaleLabel = page.locator('label[for="gender-radio-2"]');
    this.genderOtherLabel = page.locator('label[for="gender-radio-3"]');
    this.dateOfBirthInput = page.locator("#dateOfBirthInput");
    this.monthSelect = page.locator("#dp-month");
    this.yearSelect = page.locator("#dp-year");
    this.subjectsInput = page.locator("#subjectsInput");
    this.hobbySports = page.locator("#hobbies-checkbox-1");
    this.hobbyReading = page.locator("#hobbies-checkbox-2");
    this.hobbyMusic = page.locator("#hobbies-checkbox-3");
    this.uploadPicture = page.locator("#uploadPicture");
    this.currentAddress = page.locator("#currentAddress");
    this.stateDropdown = page.locator("#state");
    this.cityDropdown = page.locator("#city");
    this.submitButton = page.locator("#submit");
    this.closeModalButton = page.locator('[data-cy="close-modal-btn"]');
    this.modalTitle = page.locator('[data-cy="modal-title"]');
    this.resultTable = page.locator("#result-tbody tr");
  }

  static messages = {
    formSubmitted: "Thanks for submitting the form",
  };

  static validationColor = "rgb(220, 53, 69)";

  /**
   * Navigate to the Practice Form page
   */
  async visit() {
    await this.page.goto(this.url);
    return this;
  }

  /**
   * Fill basic text fields
   * @param {Object} data - Form data
   */
  async fillBasicInfo(data) {
    if (data.firstName) {
      await this.firstName.fill(data.firstName);
    }
    if (data.lastName) {
      await this.lastName.fill(data.lastName);
    }
    if (data.email) {
      await this.email.fill(data.email);
    }
    if (data.mobile) {
      await this.mobile.fill(data.mobile);
    }
    if (data.address) {
      await this.currentAddress.fill(data.address);
    }
    return this;
  }

  /**
   * Select gender
   * @param {'male'|'female'|'other'} gender - Gender to select
   */
  async selectGender(gender) {
    const genderLabelMap = {
      male: this.genderMaleLabel,
      female: this.genderFemaleLabel,
      other: this.genderOtherLabel,
    };
    await genderLabelMap[gender].click();
    return this;
  }

  /**
   * Select date of birth
   * @param {string} month - Month name (e.g., "January")
   * @param {string} year - Year (e.g., "1990")
   * @param {string} day - Day with leading zero (e.g., "01")
   */
  async selectDateOfBirth(month, year, day) {
    await this.dateOfBirthInput.click();
    await this.monthSelect.selectOption({ label: month });
    await this.yearSelect.selectOption(year);
    await this.page.locator(`[data-cy="day-${day}"]`).click();
    return this;
  }

  /**
   * Add a subject
   * @param {string} subject - Subject to add
   */
  async addSubject(subject) {
    await this.subjectsInput.fill(subject);
    await this.subjectsInput.press("Enter");
    return this;
  }

  /**
   * Select hobbies
   * @param {Array<'sports'|'reading'|'music'>} hobbies - Hobbies to select
   */
  async selectHobbies(hobbies) {
    const hobbyMap = {
      sports: this.hobbySports,
      reading: this.hobbyReading,
      music: this.hobbyMusic,
    };
    for (const hobby of hobbies) {
      await hobbyMap[hobby].check();
    }
    return this;
  }

  /**
   * Upload a picture file
   * @param {string} filePath - Path to the file
   */
  async uploadPictureFile(filePath) {
    await this.uploadPicture.setInputFiles(filePath);
    return this;
  }

  /**
   * Select state (country) from dropdown
   * @param {number} optionIndex - Index of the option (0-based)
   */
  async selectState(optionIndex = 0) {
    await this.stateDropdown.click();
    await this.page.locator(`#state-option-${optionIndex}`).click();
    return this;
  }

  /**
   * Select city from dropdown
   * @param {number} optionIndex - Index of the option (0-based)
   */
  async selectCity(optionIndex = 0) {
    await this.cityDropdown.click();
    await this.page.locator(`#city-option-${optionIndex}`).click();
    return this;
  }

  /**
   * Submit the form
   */
  async submit() {
    await this.submitButton.click();
    return this;
  }

  /**
   * Close the confirmation modal
   */
  async closeModal() {
    await this.closeModalButton.click();
    return this;
  }

  /**
   * Verify the confirmation modal is displayed
   */
  async verifySubmissionSuccess() {
    await expect(this.modalTitle).toContainText(
      RegisterFormPage.messages.formSubmitted
    );
    return this;
  }

  /**
   * Verify form data in the confirmation modal
   * @param {Object} expectedData - Key-value pairs of label and expected value
   */
  async verifySubmittedData(expectedData) {
    for (const [label, value] of Object.entries(expectedData)) {
      const row = this.resultTable.filter({ hasText: label });
      await expect(row.locator("td").nth(1)).toHaveText(value);
    }
    return this;
  }

  /**
   * Verify validation error on a field
   * @param {import('@playwright/test').Locator} locator - Field locator
   */
  async verifyFieldValidationError(locator) {
    await expect(locator).toHaveCSS(
      "border-color",
      RegisterFormPage.validationColor
    );
    return this;
  }

  /**
   * Verify all required field validation errors
   */
  async verifyRequiredFieldErrors() {
    await this.verifyFieldValidationError(this.firstName);
    await this.verifyFieldValidationError(this.lastName);
    await this.verifyFieldValidationError(this.mobile);

    for (let i = 1; i <= 3; i++) {
      await expect(
        this.page.locator(`label[for="gender-radio-${i}"]`)
      ).toHaveCSS("border-color", RegisterFormPage.validationColor);
    }
    return this;
  }

  /**
   * Fill complete form with all fields
   * @param {Object} data - Complete form data
   */
  async fillCompleteForm(data) {
    await this.fillBasicInfo({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      mobile: data.mobile,
      address: data.address,
    });

    if (data.gender) {
      await this.selectGender(data.gender);
    }

    if (data.dateOfBirth) {
      await this.selectDateOfBirth(
        data.dateOfBirth.month,
        data.dateOfBirth.year,
        data.dateOfBirth.day
      );
    }

    if (data.subjects) {
      for (const subject of data.subjects) {
        await this.addSubject(subject);
      }
    }

    if (data.hobbies) {
      await this.selectHobbies(data.hobbies);
    }

    if (data.picture) {
      await this.uploadPictureFile(data.picture);
    }

    if (data.state !== undefined) {
      await this.selectState(data.state);
    }

    if (data.city !== undefined) {
      await this.selectCity(data.city);
    }

    return this;
  }
}
