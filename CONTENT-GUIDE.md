# Content replacement guide

Every piece of invented content on this site is in one of **two** files. Nothing
is buried in the layout, and nothing needs restructuring when you swap real
content in.

| File | Holds | How to find placeholders |
|---|---|---|
| `assets/js/content.config.js` | All data: stats, service cards, languages, case studies, team, in-demand skills, trust points, footer links, contact details | Search for `🔴 PLACEHOLDER` |
| `index.html` | Section headings, ledes, and the hero tagline — the prose a human writes once | Search for `🔴 PLACEHOLDER` |

**Why two files, not one:** headings and the hero live as real HTML so search
engines and no-JavaScript visitors get the full message immediately. The
repeating collections are config-driven so you can add a fifth case study or a
tenth team member without touching markup. This split is what keeps both SEO and
maintainability intact.

> Fastest way to audit what's left: `grep -rn "🔴 PLACEHOLDER" .`

---

## Priority order

If you only do part of this, do it in this order — it's roughly descending by
how much damage a wrong value causes.

1. **Stats** — wrong numbers on a B2B site are a credibility problem, not a typo.
2. **Contact details** — nobody can reach you until these are real.
3. **Google Apps Script URL** — the application form does nothing without it.
4. **Case studies** — check the named/anonymised status of each with the client.
5. **Team** — names, roles, bios, photos.
6. **In-demand skills** — dated content; set a reminder to refresh it.
7. **Tagline and headings** — worth iterating on, but nothing breaks meanwhile.
8. **Social links, legal pages, OG image.**

---

## 1. Hero tagline — `index.html`

```html
<!-- 🔴 PLACEHOLDER TAGLINE — replace this line, keep the markup -->
<h1 class="hero__title" id="hero-title">
  Reach the <span class="text-gradient">Orbit</span>
</h1>
```

The `<span class="text-gradient">` wraps whichever word gets the cyan-to-violet
treatment. Keep it on **one** word or short phrase — the effect stops reading as
deliberate if it covers the whole line.

Directly beneath is the plain-language one-liner. Keep it literal: it exists so
a visitor who reads nothing else understands both service lines. Resist the urge
to make it poetic — the eyebrow above the tagline is where the orbit language
belongs.

Also update, in the same file:

- `<title>` and `<meta name="description">`
- the `og:*` and `twitter:*` tags (including `og:image` — you need a 1200×630 PNG at `assets/img/og-cover.png`)
- `<link rel="canonical">` → your real domain
- the JSON-LD block at the bottom of `<head>`

---

## 2. Section headings and ledes — `index.html`

Each section opens with a commented block. The pattern is always the same:

```html
<p class="eyebrow">Pillar 01 · Data Solutions</p>   <!-- small label -->
<h2>The groundwork every model stands on</h2>        <!-- section heading -->
<p class="lede">Training data is only as good as…</p><!-- 2–3 sentence intro -->
```

| Section | `id` | Current heading |
|---|---|---|
| Data Solutions | `#solutions` | The groundwork every model stands on |
| Software Development | `#software` | Engineers who ship, not just advise |
| Why Orbitech | `#why` | Most agencies pick a side. We didn't. |
| Meet the Team | `#team` | The people in the control room |
| Join Our Team | `#join` | Good people, wherever they are |
| Trust | `#trust` | Your data doesn't leave the perimeter |
| Contact | `#contact` | Tell us what you're building |

Changing a heading is safe. Changing an `id` is not — nav links, footer links
and the scroll-spy all key off these. If you must rename one, update it in
`content.config.js` (`nav` and `footer.columns`) and in `initScrollSpy()` in
`app.js`.

---

## 3. Everything else — `assets/js/content.config.js`

### `integrations` ⚙️
Not placeholder text — real settings.

- `GOOGLE_SCRIPT_URL` — from `backend/SETUP-GOOGLE-APPS-SCRIPT.md`. Until it's
  set, the application form runs in demo mode.
- `CONTACT_ENDPOINT` — same URL works for both forms.
- `maxUploadMB` — must match `MAX_UPLOAD_MB` in `Code.gs`.

### `company`
Emails, phone, location, response time, founded year, social URLs. Feeds the
contact block, the footer, and the error message shown if a form submission
fails. Delete any social you don't have — the row shrinks to fit.

### `dataSolutions.stats` and `software.stats`
Four each. The two pillars deliberately use **different** metrics:

- **Data Solutions** — network size, languages, acceptance rate, volume delivered.
  Network scale is the credibility signal here, *not* in-house headcount.
- **Software** — in-house engineers, years active, client satisfaction, projects.

```js
{ value: "500+", label: "Vetted specialists", note: "Annotators, linguists…" }
```

`value` should stay short — it renders at up to 48px and long strings wrap
badly. Put the qualification in `note`.

Four stats fill the row cleanly. Three or six also work; five leaves an
awkward orphan on desktop.

### `dataSolutions.services` and `software.services`
Six each. `icon` must be a key that exists in the `ICONS` map at the top of
`app.js` — anything unrecognised falls back to a neutral dot, so a typo degrades
rather than breaks. Available keys:

```
annotate  transcribe  translate  mtpe     collect  qa
web       mobile      ai         pipeline cloud    consult
globe     clock       layers     trend    pay      support
nda       access      shield     trace    delete   region
```

### `dataSolutions.languageGroups`
Group name plus an array of languages. Add, remove or rename groups freely; the
layout reflows. The count shown beside the list is calculated, so it can't drift
out of sync.

### `featuredWork` (both pillars) — **the named/anonymised card**

One component handles both. The *only* difference is which key you set:

```js
// Named client
client: { name: "Northwind Speech Labs", sector: "Conversational AI" }

// Anonymised client — renders italic, with a "Confidential" chip
client: { descriptor: "Fortune 500 e-commerce client", sector: "Retail / Search" }
```

Set one or the other, never both — `name` wins if both are present. Everything
else on the card is identical:

```js
{
  client:  { … },
  title:   "Product catalogue annotation at scale",
  summary: "One or two sentences on what the work actually was.",
  tags:    ["Image annotation", "Taxonomy", "4 languages"],
  metrics: [
    { value: "2M",  label: "Units annotated" },
    { value: "98%", label: "Acceptance rate" }
  ]
}
```

Two to four cards per pillar. Two or four sit evenly on desktop; three leaves a
gap in the second row, which is fine but worth knowing. Three metrics per card
is the sweet spot — four wraps on narrow cards.

**Before publishing:** confirm named-vs-anonymised status with each client. If
in doubt, anonymise — the card is designed so an anonymised entry still reads as
substantial, not evasive.

### `software.techStack`
Four groups of six or so. More than about eight items per group and the column
gets long relative to its neighbours.

### `why.compare` and `why.points`
`compare.them` / `compare.us` are parallel lists — keep them the same length and
in matching order so a reader can scan across. `points` is four differentiator
cards, auto-numbered `01`–`04`.

### `team`
Name, role, bio, photo.

```js
{ name: "A. Rahman", role: "Founder", bio: "…", photo: null }
```

`photo: null` renders generated initials over a nebula gradient — a deliberate,
designed placeholder rather than a broken image, so you can ship before the
photoshoot. When you have real portraits: square crops, ~600×600, saved as
`assets/img/team/name.jpg`, then `photo: "assets/img/team/name.jpg"`. Alt text
is generated from the name.

Three or six members fill the grid evenly.

### `join.pitch`
Six reasons to join. Same `icon` keys as services.

### `join.inDemand` — **the most perishable content on the page**
Languages and skills you're actively sourcing, plus `lastUpdated`, which is
displayed. Set yourself a recurring reminder. Listing languages you aren't
actually hiring for is the fastest way to burn goodwill with the talent network
you're trying to build.

### `join.referralSources`
Options in the "How did you hear about us?" dropdown. These strings are written
verbatim into the Google Sheet, so if you change them, older rows keep the old
wording.

### `trust.items` and `trust.note`

⚠️ **Read this before editing.**

The copy here is deliberately written to describe practices without claiming
certification. Do not add "ISO 27001 certified", "SOC 2 Type II" or similar
until you actually hold the certification and can produce the report. Enterprise
procurement teams verify these, and an unfounded claim ends the deal — and can
be actionable.

`trust.note` is the honest caveat that makes the rest credible: it says you're
working towards certification, aren't there yet, and will meet requirements
contractually meanwhile. Keep something in that spirit. Delete it once you have
real certifications, and replace it with them.

### `contact.inquiryTypes` and `contact.interests`
The two-path selector ("Get a project quote" / "General enquiry") and the
service dropdown. Values are recorded in the sheet.

### `footer`
Link columns and legal links. The `highlight: true` flag on *Join our team* is
what makes it cyan — keep it, it's the required quick link back to the talent
section. Point the legal links at real pages when they exist.

---

## Adding a whole new section

1. Copy an existing `<section>` block in `index.html`, give it a unique `id`.
2. Add an empty container with an `id` where the cards go.
3. Add the data to `content.config.js`.
4. Add a `render…()` function in `app.js` and call it from `render()`.
5. If it should appear in the nav, add it to `CFG.nav` and to `SECTION_TO_NAV`
   in `initScrollSpy()`.

Use `class="section section--tinted"` to alternate the background — the current
rhythm is tinted, plain, tinted, plain.

---

## Rebranding

The whole visual identity is the token block at the top of
`assets/css/orbitech.css` (section 01). Changing `--c-accent` and `--c-second`
re-themes the entire site, intro animation excepted — the canvas colours are
literals in `intro.js` (search for `rgba(79,216,232` for cyan and
`rgba(139,124,255` for violet).

If you change the accent to something lighter, re-check contrast: cyan on the
dark background currently passes WCAG AA comfortably, but a pale accent on
`--c-deep` may not.

---

## Pre-launch checklist

- [ ] `grep -rn "🔴 PLACEHOLDER" .` returns nothing you haven't reviewed
- [ ] `grep -rn "REPLACE_ME" .` returns nothing
- [ ] No `orbitech.example` addresses left anywhere
- [ ] Canonical URL, `og:url` and JSON-LD `url` point at the real domain
- [ ] `assets/img/og-cover.png` exists at 1200×630
- [ ] `assets/img/apple-touch-icon.png` exists at 180×180
- [ ] Every stat is a number you can defend if a client asks
- [ ] Every named client has agreed to being named
- [ ] Application form submitted end-to-end on the live domain; row landed in
      the sheet, email arrived, CV opened
- [ ] Contact form tested the same way
- [ ] Trust section makes no certification claim you can't evidence
- [ ] Privacy policy exists and is linked (the forms collect personal data)
