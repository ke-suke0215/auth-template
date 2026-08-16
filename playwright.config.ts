import { defineConfig } from "@playwright/test";

const baseURL = "http://localhost:5173";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    browserName: "chromium",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run db:migrate:local && npm run dev -- --host 127.0.0.1",
    env: {
      WRANGLER_REGISTRY_PATH: ".wrangler/registry",
      WRANGLER_WRITE_LOGS: "false",
    },
    url: `${baseURL}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
