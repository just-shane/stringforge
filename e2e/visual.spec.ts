import { test, expect } from "@playwright/test";
import { dismissTour, setTheme, waitForPhysics } from "./helpers";

test.describe("Visual regression @visual", () => {
  test.beforeEach(async ({ page }) => {
    await dismissTour(page);
  });

  test("main dashboard — Midnight", async ({ page }) => {
    await setTheme(page, "midnight");
    await page.goto("/");
    await waitForPhysics(page);
    // Let animations settle
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot("dashboard-midnight.png", {
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    });
  });

  test("main dashboard — Neon", async ({ page }) => {
    await setTheme(page, "neon");
    await page.goto("/");
    await waitForPhysics(page);
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot("dashboard-neon.png", {
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    });
  });

  test("main dashboard — High Contrast", async ({ page }) => {
    await setTheme(page, "high-contrast");
    await page.goto("/");
    await waitForPhysics(page);
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot("dashboard-high-contrast.png", {
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    });
  });

  test("Arrow tab layout", async ({ page }) => {
    await setTheme(page, "midnight");
    await page.goto("/");
    await waitForPhysics(page);

    await page.locator('[role="tab"]', { hasText: "Arrow" }).click();
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot("arrow-tab.png", {
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    });
  });

  test("Tune tab layout", async ({ page }) => {
    await setTheme(page, "midnight");
    await page.goto("/");
    await waitForPhysics(page);

    await page.locator('[role="tab"]', { hasText: "Tune" }).click();
    await page.waitForTimeout(1000);

    await expect(page).toHaveScreenshot("tune-tab.png", {
      maxDiffPixelRatio: 0.02,
      animations: "disabled",
    });
  });
});
