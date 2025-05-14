import { test, expect } from "@playwright/test";
import { cleanDatabase, seedDemoBoard, disconnect } from "./helpers/db";
import { loginAs } from "./helpers/auth";

test.beforeEach(async () => {
  await cleanDatabase();
  await seedDemoBoard();
});

test.afterAll(async () => {
  await disconnect();
});

test("guests are redirected to login when accessing /dashboard", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/login/);
  expect(page.url()).toContain("callbackUrl=%2Fdashboard");
});

test("guests are redirected to login when trying to vote", async ({ page }) => {
  await page.goto("/b/demo");
  const voteButton = page.locator("article").first().getByRole("button", { name: /vote/i });

  await voteButton.click();
  await expect(page).toHaveURL(/\/login/);
});

test("non-owner cannot access another user's settings", async ({ page }) => {
  // The demo board's owner is demo@upvoted.app
  // Logging in as someone else should give them a different board
  await loginAs(page, "bob@test.com");
  await page.goto("/settings");

  // Bob has his own board, not the demo one
  const slugInput = page.getByLabel("URL slug");
  await expect(slugInput).not.toHaveValue("demo");
});

test("private board returns 404 to non-owners", async ({ page, request }) => {
  // Use the API to flip the demo board to private via direct DB access would
  // require additional helpers. Easiest path: own a board, make it private,
  // then verify it 404s when logged out.
  await loginAs(page, "carol@test.com");
  await page.goto("/settings");
  await page.getByLabel("Public board").click();
  await page.getByRole("button", { name: /save changes/i }).click();
  await expect(page.getByText(/settings saved/i)).toBeVisible();

  const slugInput = page.getByLabel("URL slug");
  const slug = await slugInput.inputValue();

  // Logout and check the board is 404
  await page.goto("/dashboard");
  await page.getByRole("button", { name: /sign out/i }).click();
  await page.waitForURL("/");

  const response = await request.get(`/b/${slug}`);
  expect(response.status()).toBe(404);
});
