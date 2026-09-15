import { faker } from "@faker-js/faker";

export interface WebTableUser {
  firstName: string;
  lastName: string;
  email: string;
  age: string;
  salary: string;
  department: string;
}

export interface FormUser {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  address: string;
}

/**
 * Factory for generating test user data
 * Provides randomized but valid test data for forms and tables
 */
export const userFactory = {
  /**
   * Generate a complete user object for WebTables
   * @param overrides - Fields to override with specific values
   */
  generate(overrides: Partial<WebTableUser> = {}): WebTableUser {
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
   * @param overrides - Fields to override
   */
  generateFormUser(overrides: Partial<FormUser> = {}): FormUser {
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
   * @param min - Minimum age (default: 18)
   * @param max - Maximum age (default: 65)
   */
  generateAge(min = 18, max = 65): number {
    return faker.number.int({ min, max });
  },

  /**
   * Generate a batch of users
   * @param count - Number of users to generate
   * @param commonOverrides - Overrides to apply to all users
   */
  generateBatch(
    count: number,
    commonOverrides: Partial<WebTableUser> = {}
  ): WebTableUser[] {
    return Array.from({ length: count }, (_, index) =>
      this.generate({
        ...commonOverrides,
        firstName: `User${index}`,
      })
    );
  },
};
