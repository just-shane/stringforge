import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { dismissTour, setTheme, waitForPhysics } from "./helpers";

test.describe("Accessibility @accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await dismissTour(page);
    await setTheme(page, "midnight");
    await page.goto("/");
    await waitForPhysics(page);
  });

  test("main page has no critical a11y violations", async ({ page }) => {
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      // Exclude color-contrast for themed apps (theme-dependent)
      .disableRules(["color-contrast"])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );
    expect(critical).toEqual([]);
  });

  test("Arrow tab has no critical a11y violations", async ({ page }) => {
    await page.locator('[role="tab"]', { hasText: "Arrow" }).click();
    await page.waitForTimeout(500);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .disableRules(["color-contrast"])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );
    expect(critical).toEqual([]);
  });

  test("Tune tab has no critical a11y violations", async ({ page }) => {
    await page.locator('[role="tab"]', { hasText: "Tune" }).click();
    await page.waitForTimeout(500);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .disableRules(["color-contrast"])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );
    expect(critical).toEqual([]);
  });

  test("High Contrast theme passes color-contrast checks", async ({ page }) => {
    await setTheme(page, "high-contrast");
    await page.goto("/");
    await waitForPhysics(page);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();

    const contrastViolations = results.violations.filter(
      (v) => v.id === "color-contrast" && (v.impact === "critical" || v.impact === "serious")
    );
    expect(contrastViolations).toEqual([]);
  });

  test("tablist has proper ARIA structure", async ({ page }) => {
    // Verify tablist exists and has tabs
    const tablist = page.locator('[role="tablist"]');
    await expect(tablist).toHaveAttribute("aria-label");

    const tabs = page.locator('[role="tab"]');
    const count = await tabs.count();
    expect(count).toBe(5);

    // Each tab should have aria-selected
    for (let i = 0; i < count; i++) {
      await expect(tabs.nth(i)).toHaveAttribute("aria-selected");
    }
  });

  test("skip navigation link is present", async ({ page }) => {
    // The skip link should be in the DOM (may be visually hidden)
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeAttached();
  });

  test("main landmark is present", async ({ page }) => {
    const main = page.locator("main#main-content, main");
    await expect(main).toBeAttached();
  });
});
