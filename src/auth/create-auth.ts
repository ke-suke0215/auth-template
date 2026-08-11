import { betterAuth } from "better-auth";

import { authSchema } from "./schema";

export type Env = {
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  DB: D1Database;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
};

const minimumSecretLength = 32;

function requireValue(value: string | undefined, name: string): string {
  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

export function createAuth(env: Env) {
  const secret = requireValue(env.BETTER_AUTH_SECRET, "BETTER_AUTH_SECRET");
  if (secret.length < minimumSecretLength) {
    throw new Error(`BETTER_AUTH_SECRET must be at least ${minimumSecretLength} characters long`);
  }

  const baseURL = new URL(requireValue(env.BETTER_AUTH_URL, "BETTER_AUTH_URL"));
  const secure = baseURL.protocol === "https:";

  return betterAuth({
    ...authSchema,
    database: env.DB,
    secret,
    baseURL: baseURL.origin,
    trustedOrigins: [baseURL.origin],
    socialProviders: {
      google: {
        clientId: requireValue(env.GOOGLE_CLIENT_ID, "GOOGLE_CLIENT_ID"),
        clientSecret: requireValue(env.GOOGLE_CLIENT_SECRET, "GOOGLE_CLIENT_SECRET"),
        redirectURI: new URL("/api/auth/callback/google", baseURL).toString(),
      },
    },
    advanced: {
      useSecureCookies: secure,
      defaultCookieAttributes: {
        httpOnly: true,
        sameSite: "lax",
        secure,
      },
    },
  });
}
