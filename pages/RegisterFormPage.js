import { expect } from "@playwright/test";

/** Gender radio labels, indexed 0-2. The inputs are display:none, so tests click the label. */
const GENDER_LABELS = [
  '[data-cy="gender-male-label"]',
  '[data-cy="gender-female-label"]',
  '[data-cy="gender-other-label"]',
];

/**
 * @typedef {Object} RegisterFormData
 * @property {string} [firstName]
 * @property {string} [lastName]
 * @property {string} [email]
 * @property {string} [mobile]
 * @property {string} [address]
 * @property {'male'|'female'|'other'} [gender]
 * @property {{ month: string, year: string, day: string }} [dateOfBirth]
 * @property {string[]} [subjects]
 * @property {Array<'sports'|'reading'|'music'>} [hobbies]
 * @property {string} [picture]
 * @property {'germany'|'france'|'spain'|'italy'|'netherlands'} [state]
 * @property {string} [city]
 */

/**
 * Page Object for Automation Practice Form helper page
 * @see https://adrianjiga.github.io/qa/helpers/automation-practice-form/
 */
export class RegisterFormPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    this.url =
      "https://adrianjiga.github.io/qa/helpers/automation-practice-form/";

    this.firstName = page.locator('[data-cy="first-name-input"]');
    this.lastName = page.locator('[data-cy="last-name-input"]');
    this.email = page.locator('[data-cy="email-input"]');
    this.mobile = page.locator('[data-cy="mobile-input"]');
    this.genderMaleLabel = page.locator('[data-cy="gender-male-label"]');
    this.genderFemaleLabel = page.locator('[data-cy="gender-female-label"]');
    this.genderOtherLabel = page.locator('[data-cy="gender-other-label"]');
    this.dateOfBirthInput = page.locator('[data-cy="date-of-birth-input"]');
    this.monthSelect = page.locator('[data-cy="month-select"]');
    this.yearSelect = page.locator('[data-cy="year-select"]');
    this.subjectsInput = page.locator('[data-cy="subjects-input"]');
    this.hobbySports = page.locator('[data-cy="hobby-sports"]');
    this.hobbyReading = page.locator('[data-cy="hobby-reading"]');
    this.hobbyMusic = page.locator('[data-cy="hobby-music"]');
    this.uploadPicture = page.locator('[data-cy="upload-picture"]');
    this.currentAddress = page.locator('[data-cy="address-input"]');
    this.stateDropdown = page.locator('[data-cy="state-dropdown"]');
    this.cityDropdown = page.locator('[data-cy="city-dropdown"]');
    this.submitButton = page.locator('[data-cy="submit-btn"]');
    this.closeModalButton = page.locator('[data-cy="close-modal-btn"]');
    this.modalTitle = page.locator('[data-cy="modal-title"]');
    this.resultTable = page.locator('[data-cy="result-table"] tbody tr');
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
   * @param {RegisterFormData} data - Form data
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
   * Select a country from the custom dropdown.
   *
   * Addressed by **name**, not position. The old `#state-option-N` ids encoded an ordering
   * the test had to know but never stated, so `selectState(0)` silently meant Germany. The
   * data-cy hooks are named, which makes the intent readable and survives a reordering.
   *
   * @param {'germany'|'france'|'spain'|'italy'|'netherlands'} country
   */
  async selectState(country = "germany") {
    await this.stateDropdown.click();
    await this.page.locator(`[data-cy="state-option-${country}"]`).click();
    return this;
  }

  /**
   * Select a city from the custom dropdown. Cities are populated by the chosen country, so
   * this must run after {@link selectState}.
   *
   * Lower-cased and hyphenated, matching how the page builds the attribute:
   * `city.toLowerCase().replace(/\s+/g, "-")`. So "Frankfurt" is `frankfurt`.
   *
   * @param {string} city - e.g. "berlin"
   */
  async selectCity(city = "berlin") {
    await this.cityDropdown.click();
    await this.page.locator(`[data-cy="city-option-${city}"]`).click();
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
   * Verify the confirmation modal is displayed.
   *
   * The visibility assertion is load-bearing. The modal markup is present in the DOM from
   * page load with `display: none`, and `toContainText` does not require visibility — so on
   * its own it passes against a modal that never opened. A submission blocked by validation
   * would have looked like a success.
   */
  async verifySubmissionSuccess() {
    await expect(this.modalTitle).toBeVisible();
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
      await expect(this.page.locator(GENDER_LABELS[i - 1])).toHaveCSS(
        "border-color",
        RegisterFormPage.validationColor
      );
    }
    return this;
  }

  /**
   * Fill complete form with all fields
   * @param {RegisterFormData} data - Complete form data
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
