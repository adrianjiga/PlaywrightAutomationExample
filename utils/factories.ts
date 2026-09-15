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

export const userFactory = {
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

  generateAge(min = 18, max = 65): number {
    return faker.number.int({ min, max });
  },

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
