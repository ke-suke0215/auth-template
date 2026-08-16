import { expect, test } from "@playwright/test";

test.describe("browser smoke flows", () => {
  test("renders the login page", async ({ page }) => {
    await page.goto("/login");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Google でログイン" })).toBeVisible();
  });

  test("redirects unauthenticated users from the home page to login", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "ログイン" })).toBeVisible();
  });

  test("renders the SPA not-found page for an unknown route", async ({ page }) => {
    const response = await page.goto("/e2e-unknown-route");

    expect(response?.status()).toBe(200);
    await expect(page.getByText("404 / NOT FOUND")).toBeVisible();
    await expect(page.getByRole("heading", { name: "ページが見つかりません" })).toBeVisible();
    await expect(page.getByRole("link", { name: "ホームへ戻る" })).toBeVisible();
  });
});
