import { expect } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

export type Gender = "male" | "female" | "other";
export type Hobby = "sports" | "reading" | "music";
export type Country = "Germany" | "France" | "Spain" | "Italy" | "Netherlands";

export interface DateOfBirth {
  month: string;
  year: string;
  day: string;
}

export interface RegisterFormData {
  firstName?: string;
  lastName?: string;
  email?: string;
  mobile?: string;
  address?: string;
  gender?: Gender;
  dateOfBirth?: DateOfBirth;
  subjects?: string[];
  hobbies?: Hobby[];
  picture?: string;
  state?: Country;
  city?: string;
}

// The radio inputs are display:none, so tests click the labels. Inputs are indexed 0-2.
const GENDER_LABELS = [
  '[data-cy="genderMaleLabel"]',
  '[data-cy="genderFemaleLabel"]',
  '[data-cy="genderOtherLabel"]',
];

export class RegisterFormPage {
  readonly page: Page;
  readonly url: string;

  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly mobile: Locator;
  readonly genderMaleLabel: Locator;
  readonly genderFemaleLabel: Locator;
  readonly genderOtherLabel: Locator;
  readonly dateOfBirthInput: Locator;
  readonly monthSelect: Locator;
  readonly yearSelect: Locator;
  readonly subjectsInput: Locator;
  readonly hobbySports: Locator;
  readonly hobbyReading: Locator;
  readonly hobbyMusic: Locator;
  readonly uploadPicture: Locator;
  readonly currentAddress: Locator;
  readonly stateDropdown: Locator;
  readonly cityDropdown: Locator;
  readonly submitButton: Locator;
  readonly closeModalButton: Locator;
  readonly modalTitle: Locator;
  readonly resultTable: Locator;

  static messages = {
    formSubmitted: "Thanks for submitting the form",
  };

  static validationColor = "rgb(220, 53, 69)";

  constructor(page: Page) {
    this.page = page;
    this.url =
      "https://adrianjiga.github.io/qa/helpers/automation-practice-form/";

    this.firstName = page.locator('[data-cy="firstNameInput"]');
    this.lastName = page.locator('[data-cy="lastNameInput"]');
    this.email = page.locator('[data-cy="emailInput"]');
    this.mobile = page.locator('[data-cy="mobileInput"]');
    this.genderMaleLabel = page.locator('[data-cy="genderMaleLabel"]');
    this.genderFemaleLabel = page.locator('[data-cy="genderFemaleLabel"]');
    this.genderOtherLabel = page.locator('[data-cy="genderOtherLabel"]');
    this.dateOfBirthInput = page.locator('[data-cy="dateOfBirthInput"]');
    this.monthSelect = page.locator('[data-cy="monthSelect"]');
    this.yearSelect = page.locator('[data-cy="yearSelect"]');
    this.subjectsInput = page.locator('[data-cy="subjectsInput"]');
    this.hobbySports = page.locator('[data-cy="hobbySports"]');
    this.hobbyReading = page.locator('[data-cy="hobbyReading"]');
    this.hobbyMusic = page.locator('[data-cy="hobbyMusic"]');
    this.uploadPicture = page.locator('[data-cy="uploadPicture"]');
    this.currentAddress = page.locator('[data-cy="addressInput"]');
    this.stateDropdown = page.locator('[data-cy="stateDropdown"]');
    this.cityDropdown = page.locator('[data-cy="cityDropdown"]');
    this.submitButton = page.locator('[data-cy="submitBtn"]');
    this.closeModalButton = page.locator('[data-cy="closeModalBtn"]');
    this.modalTitle = page.locator('[data-cy="modalTitle"]');
    this.resultTable = page.locator('[data-cy="resultTable"] tbody tr');
  }

  async visit() {
    await this.page.goto(this.url);
    return this;
  }

  async fillBasicInfo(data: RegisterFormData) {
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

  async selectGender(gender: Gender) {
    const genderLabelMap = {
      male: this.genderMaleLabel,
      female: this.genderFemaleLabel,
      other: this.genderOtherLabel,
    };
    await genderLabelMap[gender].click();
    return this;
  }

  async selectDateOfBirth(month: string, year: string, day: string) {
    await this.dateOfBirthInput.click();
    await this.monthSelect.selectOption({ label: month });
    await this.yearSelect.selectOption(year);
    await this.page.locator(`[data-cy="day${day}"]`).click();
    return this;
  }

  async addSubject(subject: string) {
    await this.subjectsInput.fill(subject);
    await this.subjectsInput.press("Enter");
    return this;
  }

  async selectHobbies(hobbies: Hobby[]) {
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

  async uploadPictureFile(filePath: string) {
    await this.uploadPicture.setInputFiles(filePath);
    return this;
  }

  /**
   * Options are addressed by **name**, not position. The old `#state-option-N` ids encoded an
   * ordering the test had to know but never stated, so `selectState(0)` silently meant Germany.
   * The data-cy hooks are named, which makes the intent readable and survives a reordering.
   *
   * @param country - the visible name
   */
  async selectState(country: Country = "Germany") {
    await this.stateDropdown.click();
    await this.page
      .locator(`[data-cy="stateOption${country.replace(/\s+/g, "")}"]`)
      .click();
    return this;
  }

  /**
   * Cities are populated by the chosen country, so this must run after {@link selectState}.
   *
   * The hook is the visible name with spaces removed, matching how the page builds the
   * attribute: `cityOption${city.replace(/\s+/g, "")}`. Cities arrive capitalised, so
   * "Frankfurt" is `cityOptionFrankfurt` and "The Hague" is `cityOptionTheHague`.
   *
   * @param city - the visible name, e.g. "Berlin"
   */
  async selectCity(city: string = "Berlin") {
    await this.cityDropdown.click();
    await this.page
      .locator(`[data-cy="cityOption${city.replace(/\s+/g, "")}"]`)
      .click();
    return this;
  }

  async submit() {
    await this.submitButton.click();
    return this;
  }

  async closeModal() {
    await this.closeModalButton.click();
    return this;
  }

  /**
   * The visibility assertion is load-bearing: the modal markup exists in the DOM from page
   * load with `display: none`, and `toContainText` does not require visibility — so on its own
   * it passes against a modal that never opened. `toBeVisible()` first is what catches a
   * submission blocked by validation.
   */
  async verifySubmissionSuccess() {
    await expect(this.modalTitle).toBeVisible();
    await expect(this.modalTitle).toContainText(
      RegisterFormPage.messages.formSubmitted
    );
    return this;
  }

  async verifySubmittedData(expectedData: Record<string, string>) {
    for (const [label, value] of Object.entries(expectedData)) {
      const row = this.resultTable.filter({ hasText: label });
      await expect(row.locator("td").nth(1)).toHaveText(value);
    }
    return this;
  }

  async verifyFieldValidationError(locator: Locator) {
    await expect(locator).toHaveCSS(
      "border-color",
      RegisterFormPage.validationColor
    );
    return this;
  }

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

  async fillCompleteForm(data: RegisterFormData) {
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
