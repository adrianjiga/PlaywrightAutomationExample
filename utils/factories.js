import { faker } from "@faker-js/faker";

/**
 * Factory for generating test user data
 * Provides randomized but valid test data for forms and tables
 */
export const userFactory = {
  /**
   * Generate a complete user object for WebTables
   * @param {Object} overrides - Fields to override with specific values
   * @returns {Object} User data object
   */
  generate(overrides = {}) {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email().toLowerCase(),
      age: faker.number.int({ min: 18, max: 65 }).toString(),
      salary: faker.number.int({ min: 1000, max: 150000 }).toString(),
      department: faker.commerce.department(),
      ...overrides,
    };
  },

  /**
   * Generate user data for the practice registration form
   * @param {Object} overrides - Fields to override
   * @returns {Object} Form user data
   */
  generateFormUser(overrides = {}) {
    return {
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email().toLowerCase(),
      mobile: faker.string.numeric(10),
      address: faker.location.streetAddress(),
      ...overrides,
    };
  },

  /**
   * Generate a random age within working range
   * @param {number} min - Minimum age (default: 18)
   * @param {number} max - Maximum age (default: 65)
   * @returns {number} Random age
   */
  generateAge(min = 18, max = 65) {
    return faker.number.int({ min, max });
  },

  /**
   * Generate a batch of users
   * @param {number} count - Number of users to generate
   * @param {Object} commonOverrides - Overrides to apply to all users
   * @returns {Array<Object>} Array of user objects
   */
  generateBatch(count, commonOverrides = {}) {
    return Array.from({ length: count }, (_, index) =>
      this.generate({
        ...commonOverrides,
        firstName: `User${index}`,
      })
    );
  },
};

/**
 * Factory for generating book data (API testing)
 */
export const bookFactory = {
  /**
   * Generate book data for API tests
   * @param {Object} overrides - Fields to override
   * @returns {Object} Book data
   */
  generate(overrides = {}) {
    return {
      isbn: faker.string.numeric(13),
      title: faker.lorem.words(3),
      subTitle: faker.lorem.sentence(),
      author: faker.person.fullName(),
      publisher: faker.helpers.arrayElement([
        "O'Reilly Media",
        "No Starch Press",
      ]),
      pages: faker.number.int({ min: 50, max: 1000 }),
      description: faker.lorem.paragraph(),
      website: faker.internet.url(),
      ...overrides,
    };
  },

  /**
   * Get valid ISBN for existing book (from fixture)
   * @returns {string} Known valid ISBN
   */
  getValidIsbn() {
    return "9781449325862";
  },

  /**
   * Get an invalid ISBN for negative testing
   * @returns {string} Invalid ISBN
   */
  getInvalidIsbn() {
    return "invalid-isbn-" + faker.string.alphanumeric(5);
  },
};

/**
 * Factory for generating date data
 */
export const dateFactory = {
  /**
   * Generate a random date of birth for adults
   * @returns {Object} Date components
   */
  generateAdultBirthDate() {
    const date = faker.date.birthdate({ min: 18, max: 60, mode: "age" });
    return {
      month: date.toLocaleString("en-US", { month: "long" }),
      year: date.getFullYear().toString(),
      day: date.getDate().toString().padStart(2, "0"),
      formatted: date.toLocaleDateString("en-US"),
    };
  },

  /**
   * Generate a random past date
   * @param {number} yearsBack - How many years back maximum
   * @returns {Object} Date components
   */
  generatePastDate(yearsBack = 10) {
    const date = faker.date.past({ years: yearsBack });
    return {
      month: date.toLocaleString("en-US", { month: "long" }),
      year: date.getFullYear().toString(),
      day: date.getDate().toString().padStart(2, "0"),
    };
  },
};

/**
 * Factory for generating address data
 */
export const addressFactory = {
  /**
   * Generate a complete address
   * @returns {Object} Address components
   */
  generate() {
    return {
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state(),
      zipCode: faker.location.zipCode(),
      country: faker.location.country(),
      full: faker.location.streetAddress(true),
    };
  },
};

/**
 * Utility for seeding faker for reproducible tests
 */
export const seedFactory = {
  /**
   * Set a seed for reproducible random data
   * @param {number} seed - Seed value
   */
  setSeed(seed) {
    faker.seed(seed);
  },

  /**
   * Reset faker to random seed
   */
  resetSeed() {
    faker.seed();
  },
};
