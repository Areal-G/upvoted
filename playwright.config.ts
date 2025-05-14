import { defineConfig, devices } from "@playwright/test";

const PORT = process.env["PORT"] ?? "3000";
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 2 : 0,
  workers: 1,
  reporter: process.env["CI"] ? "github" : "list",
  timeout: 30_000,
  expect: { timeout: 5_000 },

  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],

  webServer: {
    command: "npm run start:e2e",
    url: baseURL,
    reuseExistingServer: !process.env["CI"],
    timeout: 120_000,
    env: { NODE_ENV: "production" },
  },
});
