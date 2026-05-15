import { faker } from "@faker-js/faker";

/**
 * @typedef {Object} WebTableUser
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} age
 * @property {string} salary
 * @property {string} department
 */

/**
 * @typedef {Object} FormUser
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} email
 * @property {string} mobile
 * @property {string} address
 */

/**
 * Factory for generating test user data
 * Provides randomized but valid test data for forms and tables
 */
export const userFactory = {
  /**
   * Generate a complete user object for WebTables
   * @param {Partial<WebTableUser>} [overrides] - Fields to override with specific values
   * @returns {WebTableUser} User data object
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
   * @param {Partial<FormUser>} [overrides] - Fields to override
   * @returns {FormUser} Form user data
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
   * @param {number} [min] - Minimum age (default: 18)
   * @param {number} [max] - Maximum age (default: 65)
   * @returns {number} Random age
   */
  generateAge(min = 18, max = 65) {
    return faker.number.int({ min, max });
  },

  /**
   * Generate a batch of users
   * @param {number} count - Number of users to generate
   * @param {Partial<WebTableUser>} [commonOverrides] - Overrides to apply to all users
   * @returns {WebTableUser[]} Array of user objects
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
