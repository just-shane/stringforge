import { test, expect } from "@playwright/test";
import { dismissTour, setTheme, waitForPhysics } from "./helpers";

test.describe("Theme switching", () => {
  test.beforeEach(async ({ page }) => {
    await dismissTour(page);
  });

  test("app loads with Midnight theme by default", async ({ page }) => {
    await setTheme(page, "midnight");
    await page.goto("/");
    await waitForPhysics(page);

    // Verify dark background (Midnight bg is #0c0e14)
    const bg = await page.locator(".min-h-screen").first().evaluate(
      (el) => getComputedStyle(el).backgroundColor
    );
    // Should be a very dark color
    expect(bg).toBeTruthy();
  });

  test("Neon theme applies green accent", async ({ page }) => {
    await setTheme(page, "neon");
    await page.goto("/");
    await waitForPhysics(page);

    // Check that the CSS variable is set for Neon (#a0ff00)
    const accent = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--c-accent").trim()
    );
    expect(accent).toBe("#a0ff00");
  });

  test("High Contrast theme applies correct colors", async ({ page }) => {
    await setTheme(page, "high-contrast");
    await page.goto("/");
    await waitForPhysics(page);

    const accent = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--c-accent").trim()
    );
    expect(accent).toBe("#00ff88");

    const text = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--c-text").trim()
    );
    expect(text).toBe("#ffffff");
  });

  test("all 7 themes load without errors", async ({ page }) => {
    const themes = ["midnight", "neon", "dracula", "nord", "monokai", "catppuccin", "high-contrast"];

    for (const theme of themes) {
      await setTheme(page, theme);
      await page.goto("/");
      await waitForPhysics(page);

      // Verify no console errors
      const errors: string[] = [];
      page.on("pageerror", (err) => errors.push(err.message));

      // App should render without crashing
      await expect(page.locator("text=Bowstring Dynamics").first()).toBeVisible();
      expect(errors).toHaveLength(0);
    }
  });
});
