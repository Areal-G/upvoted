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

test("board owner can change post status from the admin list", async ({ page }) => {
  await loginAs(page, "demo@upvoted.app");
  await page.goto("/posts");

  await expect(page.getByText("Existing feature request")).toBeVisible();

  // Click the status badge to open the dropdown
  await page
    .getByRole("row", { name: /existing feature request/i })
    .getByRole("button")
    .first()
    .click();

  await page.getByRole("menuitem", { name: /^planned$/i }).click();
  await expect(page.getByText(/status changed to planned/i)).toBeVisible();

  // Verify the public board reflects the change
  await page.goto("/b/demo");
  await expect(
    page.locator("article", { hasText: "Existing feature request" }).getByText("Planned"),
  ).toBeVisible();

  // And the roadmap
  await page.goto("/b/demo/roadmap");
  await expect(
    page.locator("h2", { hasText: "Planned" }).locator("../..").getByText("Existing feature request"),
  ).toBeVisible();
});

test("board owner can delete a post", async ({ page }) => {
  await loginAs(page, "demo@upvoted.app");
  await page.goto("/posts");

  page.on("dialog", (dialog) => dialog.accept());

  await page
    .getByRole("row", { name: /existing feature request/i })
    .getByRole("button", { name: /delete post/i })
    .click();

  await expect(page.getByText(/post deleted/i)).toBeVisible();
  await expect(page.getByText("Existing feature request")).not.toBeVisible();
});
