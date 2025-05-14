import type { Page } from "@playwright/test";

export async function loginAs(page: Page, email: string) {
  await page.goto(`/e2e-login?email=${encodeURIComponent(email)}`);
  await page.locator("#e2e-submit").click();
  await page.waitForURL("/dashboard", { timeout: 15_000 });
}

export async function logout(page: Page) {
  await page.goto("/dashboard");
  await page.getByRole("button", { name: /sign out/i }).click();
  await page.waitForURL("/");
}
