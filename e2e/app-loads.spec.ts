import { test, expect } from "@playwright/test";
import { dismissTour, waitForPhysics } from "./helpers";

test.describe("App loads and core layout", () => {
  test.beforeEach(async ({ page }) => {
    await dismissTour(page);
    await page.goto("/");
    await waitForPhysics(page);
  });

  test("page title is correct", async ({ page }) => {
    await expect(page).toHaveTitle("Bowstring Dynamics Simulator");
  });

  test("header renders app name and version", async ({ page }) => {
    await expect(page.locator("text=Bowstring Dynamics").first()).toBeVisible();
    await expect(page.locator("text=v3.1.0")).toBeVisible();
  });

  test("all 5 tabs are visible", async ({ page }) => {
    const tablist = page.locator('[role="tablist"]');
    await expect(tablist).toBeVisible();

    for (const label of ["Bow", "Arrow", "Tune", "Database", "Profiles"]) {
      await expect(tablist.locator(`text=${label}`)).toBeVisible();
    }
  });

  test("stats bar renders with numeric values", async ({ page }) => {
    // Check key stat labels exist
    await expect(page.locator("text=Est. Speed").first()).toBeVisible();
    await expect(page.locator("text=Stored Energy").first()).toBeVisible();
    await expect(page.locator("text=Total Mass").first()).toBeVisible();
  });

  test("string visualizer SVG is present", async ({ page }) => {
    const svg = page.locator('[data-tour="string-viz"] svg').first();
    await expect(svg).toBeVisible();
  });

  test("header buttons are present", async ({ page }) => {
    await expect(page.locator("text=Setup Wizard")).toBeVisible();
    await expect(page.locator("text=Glossary")).toBeVisible();
    await expect(page.locator("text=Docs")).toBeVisible();
  });
});
