/**
 * Page Object for DemoQA Practice Form page
 * @see https://demoqa.com/automation-practice-form
 */
export class RegisterFormPage {
  constructor(page) {
    this.page = page;
    this.url = "/automation-practice-form";

    this.firstName = page.locator("#firstName");
    this.lastName = page.locator("#lastName");
    this.email = page.locator("#userEmail");
    this.mobile = page.locator("#userNumber");
    this.genderMale = page.locator("#gender-radio-1");
    this.genderFemale = page.locator("#gender-radio-2");
    this.genderOther = page.locator("#gender-radio-3");
    this.dateOfBirthInput = page.locator("#dateOfBirthInput");
    this.monthSelect = page.locator(".react-datepicker__month-select");
    this.yearSelect = page.locator(".react-datepicker__year-select");
    this.subjectsInput = page.locator("#subjectsInput");
    this.hobbySports = page.locator("#hobbies-checkbox-1");
    this.hobbyReading = page.locator("#hobbies-checkbox-2");
    this.hobbyMusic = page.locator("#hobbies-checkbox-3");
    this.uploadPicture = page.locator("#uploadPicture");
    this.currentAddress = page.locator("#currentAddress");
    this.stateDropdown = page.locator("#state");
    this.cityDropdown = page.locator("#city");
    this.submitButton = page.locator("#submit");
    this.closeModalButton = page.locator("#closeLargeModal");
    this.modalTitle = page.locator("#example-modal-sizes-title-lg");
    this.resultTable = page.locator("table tbody tr");
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
    const genderMap = {
      male: this.genderMale,
      female: this.genderFemale,
      other: this.genderOther,
    };
    await genderMap[gender].check({ force: true });
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
    await this.monthSelect.selectOption(month);
    await this.yearSelect.selectOption(year);
    await this.page
      .locator(`.react-datepicker__day.react-datepicker__day--0${day}`)
      .first()
      .click();
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
      await hobbyMap[hobby].check({ force: true });
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
   * Select state from dropdown
   * @param {number} optionIndex - Index of the state option (0-based)
   */
  async selectState(optionIndex = 0) {
    await this.stateDropdown.click();
    await this.page.locator(`#react-select-3-option-${optionIndex}`).click();
    return this;
  }

  /**
   * Select city from dropdown
   * @param {number} optionIndex - Index of the city option (0-based)
   */
  async selectCity(optionIndex = 0) {
    await this.cityDropdown.click();
    await this.page.locator(`#react-select-4-option-${optionIndex}`).click();
    return this;
  }

  /**
   * Submit the form
   */
  async submit() {
    await this.submitButton.click({ force: true });
    return this;
  }

  /**
   * Close the confirmation modal
   */
  async closeModal() {
    await this.closeModalButton.click({ force: true });
    return this;
  }

  /**
   * Verify the confirmation modal is displayed
   */
  async verifySubmissionSuccess() {
    await this.modalTitle.waitFor({ state: "visible" });
    const text = await this.modalTitle.textContent();
    if (!text.includes(RegisterFormPage.messages.formSubmitted)) {
      throw new Error(
        `Expected message "${RegisterFormPage.messages.formSubmitted}" not found`
      );
    }
    return this;
  }

  /**
   * Verify form data in the confirmation modal
   * @param {Object} expectedData - Key-value pairs of label and expected value
   */
  async verifySubmittedData(expectedData) {
    for (const [label, value] of Object.entries(expectedData)) {
      const row = this.resultTable.filter({ hasText: label });
      const valueCell = row.locator("td").nth(1);
      await valueCell.waitFor({ state: "visible" });
      const text = await valueCell.textContent();
      if (text !== value) {
        throw new Error(`Expected "${value}" for "${label}", got "${text}"`);
      }
    }
    return this;
  }

  /**
   * Verify validation error on a field
   * @param {import('@playwright/test').Locator} locator - Field locator
   */
  async verifyFieldValidationError(locator) {
    const borderColor = await locator.evaluate(
      (el) => getComputedStyle(el).borderColor
    );
    if (borderColor !== RegisterFormPage.validationColor) {
      throw new Error(
        `Expected border color "${RegisterFormPage.validationColor}", got "${borderColor}"`
      );
    }
    return this;
  }

  /**
   * Verify all required field validation errors
   */
  async verifyRequiredFieldErrors() {
    await this.verifyFieldValidationError(this.firstName);
    await this.verifyFieldValidationError(this.lastName);
    await this.verifyFieldValidationError(this.mobile);

    // Gender radio labels
    for (let i = 1; i <= 3; i++) {
      const label = this.page.locator(`label[for="gender-radio-${i}"]`);
      const borderColor = await label.evaluate(
        (el) => getComputedStyle(el).borderColor
      );
      if (borderColor !== RegisterFormPage.validationColor) {
        throw new Error(
          `Expected border color "${RegisterFormPage.validationColor}" for gender label ${i}`
        );
      }
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
