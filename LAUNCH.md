# LAUNCH.md — StringForge.io

Deployment & launch guide for [stringforge.io](https://stringforge.io) — the browser-based archery bowstring & arrow physics simulator.

**Last updated:** March 2026

---

## Current Status

| Item | Status |
|------|--------|
| Domain | `stringforge.io` registered, pointed to ns1/ns2.stclairhosting.com |
| Codebase rebrand | **Complete** — v4.0.0, zero Grace/Prime references |
| Logo / favicon | Not yet created |
| Deployment | Not yet live |
| Analytics | Not yet added |
| SSL/HTTPS | Pending (depends on hosting setup) |

---

## 1. Rebranding ✅ DONE

All Grace/Prime Engineering references removed in v4.0.0 (`f2b5c93`). 22 files updated:

- App identity: "StringForge" / "Bowstring Dynamics Simulator"
- Header: "SF" logo + "STRINGFORGE.IO / EST. 2026"
- HTML `<title>`: "StringForge — Archery Bowstring & Arrow Physics Simulator"
- manifest.json, service worker, package.json all rebranded
- All localStorage keys migrated from `bowstring-*` to `stringforge-*`
- README, TODO, export reports, panel footers, guided tour — all clean
- 145 unit tests + lint passing on rebranded codebase

---

## 2. Logo & Favicon (Next)

Need a simple, clean icon. Options:

- **DIY route:** Create an SVG in Figma/Inkscape — bowstring under tension with an arrow, or a stylized "SF" monogram with a spark/forge motif
- **AI-generated:** Use an image generator for concepts, then trace to SVG
- **Commission:** Fiverr/99designs for a professional mark ($50-150)

### Files to produce:
| File | Size | Format | Notes |
|------|------|--------|-------|
| `public/favicon.svg` | any | SVG | Used by modern browsers |
| `public/favicon.ico` | 32x32 | ICO | Legacy fallback |
| `public/icon-192.png` | 192x192 | PNG | PWA manifest |
| `public/icon-512.png` | 512x512 | PNG | PWA manifest / splash |
| `public/apple-touch-icon.png` | 180x180 | PNG | iOS home screen |
| `docs/logo.svg` | any | SVG | README / marketing |

### Theme color decision:
- Current manifest: `#6b9eff` (blue)
- LAUNCH.md suggestion: `#3b82f6` (Tailwind blue-500)
- Recommendation: Go with `#3b82f6` — it's archery blue, works well in dark UI, strong brand signal

---

## 3. Deployment to stringforge.io

### Option A: Static hosting at St. Clair Hosting (current DNS)

Since the domain already points to stclairhosting.com nameservers:

1. `npm run build` → produces `dist/` folder
2. Upload `dist/` contents to the web root via cPanel/FTP/SFTP
3. Ensure `index.html` is served for all routes (SPA fallback):
   - Apache: add `.htaccess` with `FallbackResource /index.html`
   - Nginx: `try_files $uri $uri/ /index.html;`
4. Enable SSL via cPanel (Let's Encrypt) or hosting panel
5. Force HTTPS redirect
6. Verify: `curl -I https://stringforge.io` → 200 OK

### Option B: Vercel / Netlify / Cloudflare Pages (recommended)

More modern, zero-config for SPAs, automatic HTTPS, preview deploys:

1. Update DNS: point `stringforge.io` to Vercel/Netlify/CF nameservers (or add CNAME)
2. Connect GitHub repo → auto-deploy on push to `main`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Framework preset: Vite
6. Custom domain: `stringforge.io` + `www.stringforge.io`

**Recommendation:** Vercel or Cloudflare Pages. Both are free tier for this traffic level, automatic HTTPS, edge CDN, preview deploys on PRs. Vercel has the best Vite integration out of the box.

### Post-deploy verification checklist:
- [ ] `https://stringforge.io` loads the app
- [ ] `https://www.stringforge.io` redirects to apex (or vice versa)
- [ ] PWA install prompt works on mobile Chrome
- [ ] Service worker registers and caches assets
- [ ] Offline mode works after first visit
- [ ] Share links (`?s=...`) decode and load correctly
- [ ] Open Graph preview renders on Twitter/Discord/Slack
- [ ] Lighthouse score: Performance > 90, Accessibility > 95, SEO > 90

---

## 4. Analytics & Social Cards

### Analytics (pick one):
- **Plausible** ($9/mo or self-host) — privacy-friendly, no cookie banner needed, simple dashboard
- **Google Analytics 4** (free) — more powerful, requires cookie consent banner in EU
- **Recommendation:** Plausible. Archers are privacy-conscious outdoors people. No cookie banner = cleaner UX.

Add snippet to `index.html` `<head>`:
```html
<!-- Plausible Analytics -->
<script defer data-domain="stringforge.io" src="https://plausible.io/js/script.js"></script>
```

### Open Graph / Twitter Cards:

Add to `index.html` `<head>`:
```html
<!-- Open Graph -->
<meta property="og:title" content="StringForge — Archery Bowstring & Arrow Physics Simulator" />
<meta property="og:description" content="Real-time bowstring physics, arrow ballistics, and tuning tools. Built for archers." />
<meta property="og:image" content="https://stringforge.io/og-image.png" />
<meta property="og:url" content="https://stringforge.io" />
<meta property="og:type" content="website" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="StringForge — Archery Physics Simulator" />
<meta name="twitter:description" content="Real-time bowstring physics, arrow ballistics, and tuning tools." />
<meta name="twitter:image" content="https://stringforge.io/og-image.png" />
```

### OG Image:
- Create a 1200x630 PNG with app screenshot + StringForge logo + tagline
- Place at `public/og-image.png` (gets copied to `dist/` on build)
- Test with https://opengraph.xyz or Twitter Card Validator

---

## 5. Marketing Launch (after deploy)

See `MARKETING.md` for the full playbook. Quick hits for launch week:

1. **Reddit** — r/archery, r/bowhunting, r/CompoundBow (be genuine, show the tool, don't spam)
2. **ArcheryTalk** — DIY/Technical section, "I built a free bowstring physics simulator"
3. **YouTube** — 3-5 min screen recording: "What actually happens when you change your string material"
4. **Discord** — Archery servers, bow building communities
5. **Product Hunt** — Good for initial traffic spike and backlinks

---

## 6. Monetization Path (after traction)

See `MONETIZE.md` for the full strategy. Phase 1 (immediate):

- Ko-fi or Buy Me a Coffee link in footer — low friction donations
- Free tier = everything currently in the app

Phase 2 (with user base):
- Premium features: PDF export, cloud-saved profiles, advanced presets
- Stripe integration for $5-10/mo or one-time unlock

---

## Decision Points for Shane

Before deploying, you need to decide:

1. **Hosting:** Stay with St. Clair Hosting (upload `dist/` manually) or switch to Vercel/CF Pages (auto-deploy)?
2. **Logo:** DIY, AI-generate, or commission?
3. **Analytics:** Plausible ($9/mo) or GA4 (free but cookie banner)?
4. **GitHub repo:** Keep `just-shane/bowstring-sim` or create new `stringforge/stringforge` org?
5. **Timeline:** Launch ASAP with placeholder logo, or wait for polished branding?
