import { betterAuth } from "better-auth";
import Database from "better-sqlite3";

import { authSchema } from "../src/auth/schema";

// This instance exists only for `auth:generate`. It uses SQLite because Better
// Auth generates D1-compatible SQL from the SQLite dialect; migrations are
// applied exclusively by Wrangler, never by the Better Auth CLI.
export const auth = betterAuth({
  ...authSchema,
  database: new Database(":memory:"),
  secret: "cli-only-secret-that-is-longer-than-thirty-two-characters",
  baseURL: "http://localhost:5173",
  trustedOrigins: ["http://localhost:5173"],
  socialProviders: {
    google: {
      clientId: "cli-only-google-client-id",
      clientSecret: "cli-only-google-client-secret",
    },
  },
});
