import { makeSignature } from "better-auth/crypto";
import { env, SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";

const now = new Date().toISOString();

describe("GET /api/me", () => {
  it("returns 401 without a Better Auth session", async () => {
    const response = await SELF.fetch("http://localhost:5173/api/me");

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("returns the authenticated Better Auth user", async () => {
    const user = {
      id: "user_test_123",
      email: "test@example.com",
    };
    const sessionToken = "session-token-for-api-me-test";

    await env.DB.batch([
      env.DB
        .prepare(
          'insert into "user" ("id", "name", "email", "emailVerified", "image", "createdAt", "updatedAt") values (?, ?, ?, ?, ?, ?, ?)',
        )
        .bind(user.id, "Test User", user.email, 1, null, now, now),
      env.DB
        .prepare(
          'insert into "session" ("id", "expiresAt", "token", "createdAt", "updatedAt", "ipAddress", "userAgent", "userId") values (?, ?, ?, ?, ?, ?, ?, ?)',
        )
        .bind(
          "session_test_123",
          new Date(Date.now() + 60 * 60 * 1000).toISOString(),
          sessionToken,
          now,
          now,
          null,
          null,
          user.id,
        ),
    ]);

    const signature = await makeSignature(sessionToken, env.BETTER_AUTH_SECRET);
    const response = await SELF.fetch("http://localhost:5173/api/me", {
      headers: {
        cookie: `better-auth.session_token=${sessionToken}.${signature}`,
      },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(user);
  });
});
