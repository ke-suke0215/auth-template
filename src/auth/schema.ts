/**
 * Authentication schema customizations shared by the Worker and the Better Auth
 * CLI. Keep table names, additional fields, and schema-providing plugins here so
 * generated migrations always match the Worker runtime.
 */
export const authSchema = {
  user: {
    additionalFields: {},
  },
  session: {
    additionalFields: {},
  },
  account: {
    additionalFields: {},
  },
  verification: {
    additionalFields: {},
  },
  plugins: [] as [],
};
