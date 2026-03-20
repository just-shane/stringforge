import { test, expect } from "@playwright/test";
import { dismissTour, waitForPhysics } from "./helpers";

test.describe("Tab navigation", () => {
  test.beforeEach(async ({ page }) => {
    await dismissTour(page);
    await page.goto("/");
    await waitForPhysics(page);
  });

  test("Arrow tab shows arrow builder", async ({ page }) => {
    await page.locator('[role="tab"]', { hasText: "Arrow" }).click();
    await page.waitForTimeout(500);

    // Arrow builder should render with shaft selector
    await expect(page.locator("text=Arrow Builder").first()).toBeVisible();
  });

  test("Tune tab shows tuning panel", async ({ page }) => {
    await page.locator('[role="tab"]', { hasText: "Tune" }).click();
    await page.waitForTimeout(500);

    // Tuning panel should show nock height control
    await expect(page.locator("text=Nock Height").first()).toBeVisible();
  });

  test("Database tab shows bow database", async ({ page }) => {
    await page.locator('[role="tab"]', { hasText: "Database" }).click();
    await page.waitForTimeout(500);

    // Should show bow entries or presets
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
  });

  test("Profiles tab shows profile manager", async ({ page }) => {
    await page.locator('[role="tab"]', { hasText: "Profiles" }).click();
    await page.waitForTimeout(500);

    // Profile manager should be visible
    await expect(page.locator('[role="tabpanel"]')).toBeVisible();
  });

  test("tabs have proper ARIA attributes", async ({ page }) => {
    const tabs = page.locator('[role="tab"]');
    const count = await tabs.count();
    expect(count).toBe(5);

    // First tab (Bow) should be selected by default
    await expect(tabs.first()).toHaveAttribute("aria-selected", "true");
  });

  test("clicking tab updates aria-selected", async ({ page }) => {
    const arrowTab = page.locator('[role="tab"]', { hasText: "Arrow" });
    await arrowTab.click();
    await expect(arrowTab).toHaveAttribute("aria-selected", "true");

    // Previous tab should no longer be selected
    const bowTab = page.locator('[role="tab"]', { hasText: "Bow" });
    await expect(bowTab).toHaveAttribute("aria-selected", "false");
  });
});
