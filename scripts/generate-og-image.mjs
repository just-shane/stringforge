#!/usr/bin/env node
/**
 * Generate Open Graph image (1200x630) for social sharing.
 * Usage: node scripts/generate-og-image.mjs
 *
 * Creates a branded card with app screenshot background.
 */

import { chromium } from "playwright";
import { readFileSync, writeFileSync } from "fs";

const SVG_LOGO = readFileSync("public/favicon.svg", "utf-8")
  .replace(/width="512"/, 'width="120"')
  .replace(/height="512"/, 'height="120"');

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
});

await page.setContent(`
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        width: 1200px;
        height: 630px;
        background: linear-gradient(135deg, #0c0e14 0%, #111827 50%, #0c0e14 100%);
        font-family: 'Inter', system-ui, sans-serif;
        color: #f0f9ff;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        position: relative;
        overflow: hidden;
      }

      /* Subtle grid pattern */
      body::before {
        content: '';
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px);
        background-size: 40px 40px;
      }

      /* Glow accent */
      .glow {
        position: absolute;
        width: 400px;
        height: 400px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
        top: -100px;
        right: -100px;
      }
      .glow2 {
        position: absolute;
        width: 300px;
        height: 300px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(96, 165, 250, 0.1) 0%, transparent 70%);
        bottom: -80px;
        left: -80px;
      }

      .content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 24px;
      }

      .logo-row {
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .title {
        font-size: 72px;
        font-weight: 900;
        letter-spacing: -2px;
        background: linear-gradient(135deg, #60a5fa, #3b82f6, #93c5fd);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .subtitle {
        font-size: 28px;
        font-weight: 400;
        color: #94a3b8;
        letter-spacing: 0.5px;
      }

      .tags {
        display: flex;
        gap: 12px;
        margin-top: 8px;
      }
      .tag {
        padding: 6px 16px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 0.5px;
        background: rgba(59, 130, 246, 0.15);
        border: 1px solid rgba(59, 130, 246, 0.3);
        color: #93c5fd;
      }

      .url {
        font-size: 20px;
        font-weight: 700;
        color: #60a5fa;
        letter-spacing: 1px;
        margin-top: 4px;
      }
    </style>
  </head>
  <body>
    <div class="glow"></div>
    <div class="glow2"></div>
    <div class="content">
      <div class="logo-row">
        ${SVG_LOGO}
        <span class="title">StringForge</span>
      </div>
      <div class="subtitle">Archery Bowstring & Arrow Physics Simulator</div>
      <div class="tags">
        <span class="tag">STRING PHYSICS</span>
        <span class="tag">ARROW BALLISTICS</span>
        <span class="tag">BOW TUNING</span>
        <span class="tag">REAL-TIME</span>
      </div>
      <div class="url">stringforge.io</div>
    </div>
  </body>
  </html>
`);

await page.waitForTimeout(500);
const buf = await page.screenshot({ type: "png" });
writeFileSync("public/og-image.png", buf);
console.log("✅ public/og-image.png (1200x630)");

await browser.close();
