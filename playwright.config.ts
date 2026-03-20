import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:5174",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Disable animations for deterministic visual tests
    reducedMotion: "reduce",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: process.env.CI ? "npm run preview -- --port 5174" : "npm run dev",
    url: "http://localhost:5174",
    reuseExistingServer: !process.env.CI,
    timeout: process.env.CI ? 60000 : 30000,
  },
});
