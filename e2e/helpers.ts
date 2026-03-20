import type { Page } from "@playwright/test";

/**
 * Dismiss the guided tour and set a clean state before each test.
 * Call this in beforeEach or at the start of each test.
 */
export async function dismissTour(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem("stringforge-tour-completed", "true");
    localStorage.setItem("stringforge-tour-version", "4.0.0");
    // Inject a MutationObserver to nuke the joyride portal as soon as it appears
    const observer = new MutationObserver(() => {
      const portal = document.getElementById("react-joyride-portal");
      if (portal) {
        portal.remove();
        observer.disconnect();
      }
    });
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        observer.observe(document.body, { childList: true, subtree: true });
      });
    }
  });
}

/**
 * Set a specific theme before navigation.
 */
export async function setTheme(page: Page, themeId: string) {
  await page.addInitScript((id) => {
    localStorage.setItem("stringforge-theme", id);
  }, themeId);
}

/**
 * Wait for the physics engine to compute and the stats bar to populate.
 */
export async function waitForPhysics(page: Page) {
  // Stats bar shows "fps" text when physics is computed
  await page.locator("text=fps").first().waitFor({ timeout: 10000 });
}
