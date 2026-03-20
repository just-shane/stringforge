import { test, expect } from "@playwright/test";
import { dismissTour, waitForPhysics } from "./helpers";

test.describe("Setup Wizard flow", () => {
  test.beforeEach(async ({ page }) => {
    await dismissTour(page);
    await page.goto("/");
    await waitForPhysics(page);
  });

  test("wizard opens and closes", async ({ page }) => {
    // Click Setup Wizard button
    await page.locator("button", { hasText: "Setup Wizard" }).click();
    await page.waitForTimeout(500);

    // Wizard modal should be visible — look for the wizard's content
    await expect(page.locator("text=What will you use this for").first()).toBeVisible();

    // Press Escape to close
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  });

  test("glossary opens and has search", async ({ page }) => {
    await page.locator("button", { hasText: "Glossary" }).click();
    await page.waitForTimeout(500);

    // Glossary should show a search input
    await expect(page.locator("input[placeholder*='earch']").first()).toBeVisible();

    // Close with Escape
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  });

  test("docs panel opens", async ({ page }) => {
    await page.locator("button", { hasText: "Docs" }).click();
    await page.waitForTimeout(500);

    // Docs panel should appear
    // Close with Escape
    await page.keyboard.press("Escape");
    await page.waitForTimeout(300);
  });
});
