#!/usr/bin/env node
/**
 * Generate PNG icons from favicon.svg using Playwright.
 * Usage: node scripts/generate-icons.mjs
 */

import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "fs";

const SVG = readFileSync("public/favicon.svg", "utf-8");

const sizes = [
  { name: "public/icon-192.png", size: 192 },
  { name: "public/icon-512.png", size: 512 },
  { name: "public/apple-touch-icon.png", size: 180 },
];

const browser = await chromium.launch();

for (const { name, size } of sizes) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });

  await page.setContent(`
    <!DOCTYPE html>
    <html>
    <head><style>
      * { margin: 0; padding: 0; }
      body { width: ${size}px; height: ${size}px; overflow: hidden; }
      svg { width: ${size}px; height: ${size}px; }
    </style></head>
    <body>${SVG}</body>
    </html>
  `);

  const buf = await page.screenshot({ type: "png", omitBackground: true });
  writeFileSync(name, buf);
  console.log(`✅ ${name} (${size}x${size})`);
  await page.close();
}

await browser.close();
console.log("Done!");
