# Discover Tiama

A single-page, framework-free site (plain HTML/CSS/JS — no build step, no npm install)
for the Tiama Moisturizing Bars academic case. Recreated as a portable static site so it
can be hosted permanently, for free, without depending on any third-party platform.

The whole page is a piece of 3D storytelling: it opens on the soap itself, then scrolls
through where the ingredient comes from (Hokkaido, Japan), how it's milked, how it's
flown to India, how it's blended with fruit, and how it becomes the bar you hold — before
the celebrity/influencer section and the flavour + pricing showcase.

## Files

- `index.html` — all page content and structure
- `style.css` — design system (colors, type, layout)
- `script.js` — interactivity: the 3D hero, the scroll-driven "Milk Journey" story, the
  3D product showcase, the bath mood mixer, mood tabs, pack picker, and quiz
- `assets/three.min.js` — Three.js r160, self-hosted (see "3D graphics" below)
- `assets/tiama-hero.jpg` — product shot (fallback image for the hero and showcase)
- `assets/influencer.jpg` — proposed campaign visual (academic concept section)

## 3D graphics

Three sections use real, interactive 3D (built with **Three.js**, WebGL), not flat
illustrations or photos:

- **Hero** — three oval Tiama bars (one per flavour), gently rotating, the very first
  thing visitors see: "Tiama the soap."
- **The Milk Journey** — a pinned, scroll-scrubbed 3D scene that tells the ingredient
  story as you scroll: a low-poly cow grazing in Hokkaido → the cow being milked into a
  pail → an airplane flying a curved path from Japan to India → the milk blending with
  three real berries → milled and cut into the three finished, oval bars. The camera
  travels between five 3D "beats" in sync with the scroll position and the stage copy
  on the right.
- **Product showcase** — each flavour's bar, modeled as a proper oval/lozenge shape
  (extruded and bevelled, not a sphere), rotating as you scroll and swapping colour,
  copy and pricing per flavour.

**Dependency:** Three.js is **self-hosted** in `assets/three.min.js` — it is not loaded
from a CDN. This means the 3D content works fully offline once the page is downloaded;
there is nothing to fetch from a third party and nothing that can break if a CDN goes
down.

**Graceful fallback:** if WebGL isn't supported, the visitor has `prefers-reduced-motion`
set, the viewport is ≤ 860px wide, or anything about the 3D setup throws an error, each
of the three sections automatically falls back to a static version — flat illustrations
for the Milk Journey, and a static product photo for the hero and showcase — with all the
same copy, pricing and flavour-switching controls. Nothing breaks or shows blank.

## Mobile

The whole page is responsive down to small phones (~375px wide) as well as tablets,
while keeping the original layout on laptop/desktop widths:

- Below 860px wide, the top nav collapses into a hamburger menu (tap to open a
  dropdown with all section links plus the "Find my Tiama" button). Above 860px it's
  the original full horizontal nav bar — nothing changed there.
- Below 860px, all three 3D sections (hero, Milk Journey, showcase) automatically
  switch to their static fallback described above, so nothing gets clipped inside a
  fixed-height section or asks a phone to render a heavy WebGL scene.

## Swapping images later

To replace either photo, just overwrite the file in `assets/` with a new one of the
same name — `index.html` already points at both, so no code changes are needed as
long as the filename stays the same. If you rename a file, update the matching
`src="assets/..."` in `index.html` to match.

## Deploy to GitHub Pages (free, permanent, no billing risk)

1. Create a new repository on GitHub (public repos get free Pages hosting).
2. Upload `index.html`, `style.css`, `script.js`, and your `assets/` folder to the repo
   (drag-and-drop on github.com works fine, or `git push` if you're comfortable with git).
3. Go to the repo's **Settings → Pages**.
4. Under "Build and deployment", set **Source** to "Deploy from a branch", branch
   `main`, folder `/ (root)`. Save.
5. GitHub gives you a live URL within a minute or two, typically:
   `https://<your-username>.github.io/<repo-name>/`
6. Test it on your phone, then generate a fresh QR code pointing at that URL — it will
   never expire or need payment, since GitHub Pages hosting is free indefinitely.

## Local preview

No build step needed. Either:
- Double-click `index.html` to open it directly in a browser, or
- Run a tiny local server from this folder: `python3 -m http.server 8000` and visit
  `http://localhost:8000`.

Note: opening via `file://` (double-click) can occasionally block Three.js's module
loading in some browsers' stricter security settings — if the 3D scenes don't appear
that way but the rest of the page looks fine, use the local server method instead, or
just try the real deployed GitHub Pages link.
