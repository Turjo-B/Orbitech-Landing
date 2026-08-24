# Orbitech — landing site

A single-page marketing site for Orbitech: multilingual data solutions and
software engineering. Static HTML, CSS and vanilla JavaScript — no build step,
no framework, no dependencies.

```
orbitech/
├── index.html                          the page
├── assets/
│   ├── css/orbitech.css                design system + all styles
│   └── js/
│       ├── content.config.js           ← ALL placeholder content lives here
│       ├── intro.js                    cinematic opening sequence
│       └── app.js                      rendering, nav, forms
├── backend/
│   ├── Code.gs                         Google Apps Script form backend
│   └── SETUP-GOOGLE-APPS-SCRIPT.md     10-minute deployment guide
├── CONTENT-GUIDE.md                    where every placeholder lives
├── robots.txt · sitemap.xml            update the domain before launch
└── verify.js                           automated render / a11y test suite
```

## Running it

Open `index.html` in a browser. That's it — it works from the filesystem.

For a local server (needed if you want to test the live form endpoint, since
`file://` origins are blocked by CORS):

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

## Deploying

Upload the whole folder to any static host — Netlify, Vercel, Cloudflare Pages,
GitHub Pages, S3, or plain nginx. There is nothing to build and no server to
run. `backend/` is documentation only; it doesn't need uploading.

Two things to do before launch:

1. **Wire up the forms** — follow `backend/SETUP-GOOGLE-APPS-SCRIPT.md`. Until
   you do, both forms run in demo mode: they validate and confirm, but send
   nothing.
2. **Replace the placeholder content** — follow `CONTENT-GUIDE.md`. Start with
   `grep -rn "🔴 PLACEHOLDER" .`

## How it's put together

**Content vs. structure.** Section headings and the hero live as real HTML so
search engines and no-JS visitors get the full message immediately. Repeating
collections — stats, service cards, case studies, team, languages — render from
`content.config.js`, so adding a fifth case study never touches markup.

**The opening sequence.** Canvas 2D, hand-written, no library: parallax
starfield → warp → planet limb rising → settles into the hero. It refuses to
play when `prefers-reduced-motion` is set, on small or touch-primary devices, on
Save-Data or slow connections, on low-core-and-low-memory hardware, or if it has
already run this browser session. Every one of those paths lands on the hero's
static poster, which is pure CSS and always underneath. Skip control is the
first focusable element and Escape works too.

**Accessibility.** Semantic landmarks, one `h1`, no heading-level skips, a skip
link, visible focus throughout, labelled form controls with `aria-invalid` and
live-region status messages, 44px minimum touch targets, and full
reduced-motion, high-contrast and print stylesheets. Every sampled text/
background pair passes WCAG AA — verified against rendered pixels, not
estimated.

**Performance.** ~44 KB gzipped in total (170 KB raw — most of that is
comments, which compress away), zero runtime dependencies, and no image
requests at all: the space scene is CSS gradients and a canvas. Google Fonts
is the only third-party request; it's preconnected and `display=swap`, so text
paints immediately in the fallback stack. If you'd rather have no third-party
request at all, download Inter and Space Grotesk, drop the woff2 files in
`assets/fonts/`, and swap the `<link>` in `index.html` for local `@font-face`
rules.

## Verifying changes

```bash
npm install          # playwright, dev-only
node verify.js
```

Renders the page at 390 / 834 / 1440 / 1920, plus reduced-motion, no-JS and
first-visit-vs-return passes. Checks console errors, every rendered collection,
heading order, horizontal overflow, WCAG AA contrast on real pixels, header
reveal, scroll-spy, anchor offsets, both forms' validation and success paths,
mobile menu keyboard behaviour, and touch target sizes. Screenshots land in
`.verify/`.

Not needed to run or deploy the site — delete `verify.js`, `package.json` and
`node_modules/` if you don't want them.

## Browser support

Evergreen Chrome, Edge, Firefox and Safari (last 2 versions). Degrades
gracefully further back: no `backdrop-filter` gives a solid header, no
`IntersectionObserver` falls back to scroll listeners, no JavaScript still
renders the hero, headings and prose.
