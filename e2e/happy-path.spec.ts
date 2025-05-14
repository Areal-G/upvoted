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

test("user can sign in, create a post, vote, and comment", async ({ page }) => {
  // 1. Land on home
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /ship what your users actually want/i }),
  ).toBeVisible();

  // 2. Visit the public demo board as a guest
  await page.getByRole("link", { name: /view live demo/i }).click();
  await expect(page).toHaveURL(/\/b\/demo$/);
  await expect(page.getByText("Existing feature request")).toBeVisible();

  // 3. Sign in (e2e bypass)
  await loginAs(page, "alice@test.com");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: /overview/i })).toBeVisible();

  // 4. Navigate back to the demo board
  await page.goto("/b/demo");

  // 5. Create a post
  await page.getByRole("button", { name: /suggest an idea/i }).click();
  await page.getByLabel("Title").fill("Add dark mode");
  await page
    .getByLabel("Description")
    .fill("Would be great to have a dark theme for the dashboard.");
  await page.getByRole("button", { name: /^post$/i }).click();

  // 6. Verify post appears
  await expect(page.getByText("Add dark mode")).toBeVisible();

  // 7. Vote on it
  const postCard = page.locator("article").filter({ hasText: "Add dark mode" });
  const voteButton = postCard.getByRole("button", { name: /^vote$/i });
  await expect(voteButton).toHaveAttribute("aria-pressed", "false");
  await voteButton.click();
  await expect(voteButton).toHaveAttribute("aria-pressed", "true");

  // 8. Open the post detail and comment
  await postCard.getByRole("link", { name: "Add dark mode" }).click();
  await expect(page).toHaveURL(/\/b\/demo\/posts\/[a-z0-9]+$/);

  await page.getByPlaceholder(/add a comment/i).fill("Strongly agree, would use this daily.");
  await page.getByRole("button", { name: /comment/i }).click();
  await expect(page.getByText("Strongly agree, would use this daily.")).toBeVisible();

  // 9. Confirm vote persisted across pages
  await expect(page.getByRole("button", { name: /remove vote/i })).toBeVisible();
});
