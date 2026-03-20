#!/usr/bin/env node
/**
 * Screenshot capture script for README.
 * Usage: npx playwright install chromium && node scripts/capture-screenshots.mjs
 *
 * Requires: npm install -D playwright (one-time)
 * Captures 4 screenshots used in README.md → docs/screenshots/
 */

import { chromium } from "playwright";
import { mkdirSync } from "fs";

const URL = "http://localhost:5174";
const OUT = "docs/screenshots";
const VIEWPORT = { width: 1400, height: 900 };

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: VIEWPORT });

// Inject localStorage values before any page script runs
await page.addInitScript(() => {
  try {
    localStorage.setItem("bowstring-tour-seen", "99.0.0");
    localStorage.setItem("bowstring-theme", "midnight");
  } catch {}
});
// Navigate to origin first so localStorage is available, then reload
await page.goto(URL, { waitUntil: "load", timeout: 15000 });
// addInitScript only runs on navigations after it's set, so reload
await page.reload({ waitUntil: "load", timeout: 15000 });
await page.waitForTimeout(2000); // let animations settle
// Close tour modal if somehow still visible
const tourClose = await page.$('button[data-action="skip"]');
if (tourClose) await tourClose.click();
await page.waitForTimeout(500);

// 1. Hero — main dashboard
console.log("📸 hero-main.png");
await page.screenshot({ path: `${OUT}/hero-main.png`, fullPage: false });

// 2. Charts — force-draw + energy breakdown
console.log("📸 charts-energy.png");
await page.evaluate(() => {
  const panels = document.querySelectorAll(".overflow-y-auto");
  for (const p of panels) {
    if (p.querySelectorAll("svg").length > 0) {
      p.scrollTop = 400;
    }
  }
});
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/charts-energy.png`, fullPage: false });

// 3. Sound & harmonics
console.log("📸 sound-harmonics.png");
await page.evaluate(() => {
  const panels = document.querySelectorAll(".overflow-y-auto");
  for (const p of panels) {
    if (p.querySelectorAll("svg").length > 0) {
      p.scrollTop = p.scrollHeight;
    }
  }
});
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/sound-harmonics.png`, fullPage: false });

// 4. Neon theme variant — new context so addInitScript doesn't override
console.log("📸 theme-neon.png");
const neonPage = await browser.newPage({ viewport: VIEWPORT });
await neonPage.addInitScript(() => {
  try {
    localStorage.setItem("bowstring-tour-seen", "99.0.0");
    localStorage.setItem("bowstring-theme", "neon");
  } catch {}
});
await neonPage.goto(URL, { waitUntil: "load", timeout: 15000 });
await neonPage.reload({ waitUntil: "load", timeout: 15000 });
await neonPage.waitForTimeout(2000);
const neonTourClose = await neonPage.$('button[data-action="skip"]');
if (neonTourClose) await neonTourClose.click();
await neonPage.waitForTimeout(500);
await neonPage.screenshot({ path: `${OUT}/theme-neon.png`, fullPage: false });
await neonPage.close();

await browser.close();
console.log("✅ All screenshots saved to docs/screenshots/");
