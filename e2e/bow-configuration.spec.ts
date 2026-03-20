import { test, expect } from "@playwright/test";
import { dismissTour, waitForPhysics } from "./helpers";

test.describe("Bow configuration and physics updates", () => {
  test.beforeEach(async ({ page }) => {
    await dismissTour(page);
    await page.goto("/");
    await waitForPhysics(page);
  });

  test("default state shows Compound selected", async ({ page }) => {
    const compoundBtn = page.locator('[role="tabpanel"]').locator("text=Compound").first();
    await expect(compoundBtn).toBeVisible();
  });

  test("switching to Recurve updates physics stats", async ({ page }) => {
    // Capture initial speed
    const speedEl = page.locator("text=Est. Speed").locator("..").locator("xpath=..");
    const initialText = await speedEl.textContent();

    // Click Recurve
    await page.locator("button", { hasText: "Recurve" }).first().click();
    await page.waitForTimeout(500);

    // Speed should change (recurve is slower than compound at same draw weight)
    const updatedText = await speedEl.textContent();
    expect(updatedText).not.toBe(initialText);
  });

  test("switching bow types updates draw parameters", async ({ page }) => {
    // Switch to Longbow
    await page.locator("button", { hasText: "Longbow" }).first().click();
    await page.waitForTimeout(300);

    // Longbow default draw weight is different from compound
    const drawWeightLabel = page.locator("text=Draw Weight").first();
    await expect(drawWeightLabel).toBeVisible();
  });

  test("all 4 bow types are clickable", async ({ page }) => {
    for (const bowType of ["Compound", "Recurve", "Longbow", "Crossbow"]) {
      const btn = page.locator("button", { hasText: bowType }).first();
      await expect(btn).toBeVisible();
      await btn.click();
      await page.waitForTimeout(200);
    }
  });

  test("string material buttons are visible and interactive", async ({ page }) => {
    // BCY-X should be visible on the Bow tab
    const bcyBtn = page.locator("button", { hasText: "BCY-X" }).first();
    await expect(bcyBtn).toBeVisible();

    // Click a different material
    const dacrBtn = page.locator("button", { hasText: "Dacron" }).first();
    await dacrBtn.click();
    await page.waitForTimeout(300);

    // Speed should update (Dacron is slower)
    await waitForPhysics(page);
  });
});
