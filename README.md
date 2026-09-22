# Discover Tiama

A single-page, framework-free site (plain HTML/CSS/JS — no build step, no npm install,
no libraries at all) for the Tiama Moisturizing Bars academic case.

The whole page is one continuous scrolling story. A single full-screen 3D scene sits
fixed behind the page while editorial "plates" of copy scroll over it, the scenes play
as you scroll, and the light shifts with them — from the brand's own warm ivory, to the
cold blue of a Bokkaido morning, up to altitude, into the warm gold of arrival in India,
through the moods, and out to a deep plum close.

**On the three moods:** the bars are named after fruit and coloured to match, but the
copy does not claim the bar contains fruit — the fruit names the mood, the Bokkaido milk
is the ingredient that does the work.

## Files

- `index.html` — all page content and structure
- `style.css` — design system (colour, type, plates, layout)
- `script.js` — the 3D renderer, the models, the light arc and the scroll wiring
- `assets/influencer.jpg` — proposed campaign visual (academic concept section)
- `assets/tiama-hero.jpg` — product shot (kept for reference; not used by the page)

## The chapters

| # | Chapter | What plays as you scroll |
|---|---------|--------------------------|
| 00 | Milk. Berries. Young at Heart. | the oval bar turns and drifts |
| 01 | Bokkaido | a cow grazes — head down, head up, tail swinging |
| 02 | An exceptionally rich milk | milk falls from the udder and the basin fills |
| 03 | Brought to India — a first | the plane flies the arc, leaving a trail |
| 04 | One base, three moods | a drop of milk falls into the three fruits and splashes |
| 05 | And the bar takes shape | the fruits spiral in and the bar rises in their place |
| 06 | Same milk story. Different energy. | the three moods |
| 07 | What's inside the Tiama story? | the 10-second decode |
| 08 | Young at Heart, brought to life. | the proposed campaign visual |
| 09 | Start small. Feel the difference. | pricing — ₹49 trial, ₹92 full size |
| 10 | In one line | the close |

Chapters 01–05 are **scrubbed by scroll**: each scene is rebuilt every frame as a
function of how far through that chapter you are, so scrolling back and forth plays the
action forwards and backwards. Idle touches (the grazing cycle, falling drops, the bar's
drift) run on their own clock.

## How the 3D works

There is **no Three.js and no WebGL**. The 3D is a small software renderer (about 120
lines) drawing into a normal 2D canvas:

- Models are built from primitives — boxes, rotated boxes, cylinders, balls, and an
  `oval()` lozenge that makes the Tiama bar's pillowed shape.
- Each scene is a function of `(p, t)` and is rebuilt from scratch every frame, so parts
  can move independently. Its auto-fit is computed once from the union of bounds across
  the whole animation, so nothing rescales or drifts while it plays.
- Cylinders can be left open-ended, which is what lets you see the milk inside the
  basin — a closed cylinder's end cap would sit over it like a lid.
- Faces are projected by hand, sorted back-to-front (painter's algorithm), flat-shaded
  against a fixed light direction, and filled with a matching stroke to close seams.
  Curved surfaces stroke in their own fill colour so no wireframe grid shows; flat-sided
  pieces keep a darker edge, which is what gives them their drawn look.
- Ground discs are forced to the back of the sort, since one big flat quad would
  otherwise paint over the objects standing on it.
- As a chapter scrolls through the middle of the screen its model fades in and turns.
  Scenes that need a specific read (the milking, the plane) turn through a narrower arc
  so nothing important hides behind anything else.

Because it's plain canvas 2D, it works without WebGL, needs no GPU, has nothing to
download, and behaves the same everywhere.

## Mobile

**The 3D runs on phones too** — it isn't switched off, just rearranged. Below 820px the
scene moves to the top of the screen and the plate pins underneath it, so the two never
overlap, and the model still turns as you scroll. Tested down to 390px wide with no
horizontal scrolling.

## Reduced motion

With `prefers-reduced-motion: reduce`, the scenes still draw — they just hold still at
the midpoint of their animation instead of playing, the idle clock stops, and smooth
scrolling and the scroll-cue animation are switched off. Nothing is hidden; nothing
moves.

## Swapping images later

To replace the campaign photo, overwrite `assets/influencer.jpg` with a new file of the
same name — `index.html` already points at it, so no code changes are needed. If you
rename it, update the matching `src="assets/..."` in `index.html`.

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

The only thing fetched from the internet is the web fonts (Google Fonts). If they're
blocked the page falls back to system fonts and everything else still works.
