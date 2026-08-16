import path from "node:path";
import { cloudflareTest, readD1Migrations } from "@cloudflare/vitest-pool-workers";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    cloudflareTest(async () => ({
      wrangler: {
        configPath: "./wrangler.test.jsonc",
      },
      miniflare: {
        bindings: {
          BETTER_AUTH_SECRET: "test-secret-that-is-longer-than-thirty-two-characters",
          BETTER_AUTH_URL: "http://localhost:5173",
          GOOGLE_CLIENT_ID: "test-google-client-id",
          GOOGLE_CLIENT_SECRET: "test-google-client-secret",
          TEST_MIGRATIONS: await readD1Migrations(path.join(process.cwd(), "migrations")),
        },
      },
    })),
  ],
  test: {
    include: ["test/**/*.test.ts"],
    setupFiles: ["./test/setup.ts"],
  },
});
