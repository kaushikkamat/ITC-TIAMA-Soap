# Tiama — Moisturizing Bars

A single-page brand site for the Tiama Moisturizing Bars academic case. Plain
HTML/CSS/JS — no build step, no npm install, no libraries.

Everything visual is **2D**: flat SVG illustration, CSS, and a little scroll maths.
There is no canvas and no WebGL anywhere in the project.

## Files

- `index.html` — page content, and the five SVG story scenes
- `style.css` — the design system and layout
- `script.js` — scroll story, reveals, mood switcher, counters, site chrome
- `assets/influencer.jpg` — proposed campaign visual (academic concept section)
- `assets/tiama-hero.jpg` — product photo, kept for reference; not used by the page

## Colour

The palette is built on a deep plum ink over warm paper, with the three moods as
accents:

| Token | Value | Used for |
|---|---|---|
| `--ink` | `#241627` | text, buttons, dark bands |
| `--paper` | `#FCF9F4` | page background |
| `--night` | `#1B1020` | the story section |
| `--blueberry` | `#3D4FC4` | mood 01 |
| `--goji` | `#D9622F` | mood 02, and the wordmark's "MA" |
| `--acai` | `#7E2856` | mood 03 |

`--accent` and `--accent-soft` are live variables. Picking a mood rewrites them on
`:root`, so the eyebrow, italic headline words, tab, ticks, buttons, plan border,
scroll-progress bar and the section's own background all retint together. That is one
line of JS driving the whole page's colour.

## The scroll story

`#story` is a tall track with a `position: sticky` stage inside it. Scroll position
across the track gives a 0–1 value; that maps to a chapter index plus a local 0–1,
and each scene animates its own SVG parts from that local value. Scrolling back up
plays each scene in reverse.

| # | Chapter | What moves |
|---|---------|------------|
| 01 | It starts on a cold pasture | the cow grazes, clouds drift, hills parallax |
| 02 | An exceptionally rich milk | milk falls from the udder, the pail fills |
| 03 | Brought to India — a first | the route draws itself and the plane flies it, turning to follow the path |
| 04 | One base, three moods | a drop of milk falls, splashes, and the three fruits rise |
| 05 | And the bar takes shape | the fruits fold away and the bar rises in their place |

The plane follows the real curve: `getPointAtLength()` on the route path gives its
position, and the angle to the next point gives its rotation. The chapter rail is
clickable and scrolls to any chapter.

## Interactions

- Sticky header that gains a border once you leave the top, plus a scroll-progress bar
- Reveal-on-scroll for every section, with staggered delays
- Clickable story rail
- Mood switcher that retints the page (above)
- Stat counters that count up when they come into view
- FAQ accordion
- Hamburger nav below 760px

## Accuracy

Two things the copy is careful about:

- **Bokkaido**, never "Hokkaido" — and the page does not name Japan anywhere.
- **The bar is not claimed to contain fruit.** The three moods are fruit-*inspired*:
  the fruit names the mood and sets the colour and fragrance, and the imported
  Bokkaido milk is the ingredient that does the work. The FAQ answers this directly.

The campaign section carries its academic disclaimer, and pricing is marked
illustrative.

## Responsive & reduced motion

Laid out for laptop, tablet and phone, tested from 360px up to 1920px with no
horizontal scrolling. Below 760px the nav collapses to a hamburger and the story
stacks the stage above the copy.

With `prefers-reduced-motion: reduce`, reveals are shown immediately, the marquee and
float animations stop, smooth scrolling is off, and each story scene holds still at
the midpoint of its animation. Nothing is hidden.

## Deploy to GitHub Pages

1. Create a repository on GitHub (public repos get free Pages hosting).
2. Upload `index.html`, `style.css`, `script.js` and the `assets/` folder.
3. Repo **Settings → Pages**.
4. Under "Build and deployment", set **Source** to "Deploy from a branch", branch
   `main`, folder `/ (root)`. Save.
5. The live URL appears within a minute or two, typically
   `https://<your-username>.github.io/<repo-name>/`.

Updating an existing repo: upload the same four items and they overwrite in place, so
the URL and any QR code keep working.

## Local preview

Either double-click `index.html`, or run `python3 -m http.server 8000` from this
folder and open `http://localhost:8000`.

The only external request is the Google Fonts stylesheet. If it is blocked the page
falls back to system fonts and everything else still works.
