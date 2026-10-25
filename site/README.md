# FRAMES — Joacim Tuhin Gain · Design Engineer

**Current version: v0.9** (2026-10-26). Every version is kept in `../versions/`.

A story-driven portfolio. Plain HTML, CSS and JavaScript: no framework, no build step, no dependencies.

## Run it locally

```bash
python3 -m http.server 8420 --directory site
```

Then open http://localhost:8420. (Opening the files directly with `file://` won't work, because the scripts are ES modules.)

## Pages

| Page | What |
|---|---|
| `index.html` | The story: cold open → Act I Roots → Act II UX career → Act III Design Engineer → contact → credits |
| `work.html` | Featured case studies, selected projects, archive (contact sheet / timeline), filters |
| `work/recyclium.html` | Case study 01 · with a live tier specimen |
| `work/clm.html` | Case study 02 · with a live delivery-slot specimen and a 2019 → today slider |
| `work/gridops.html` | Case study 03 · placeholders until screens and recordings arrive |
| `more.html` | The other frames: documentaries, graphics, photography, drawings, education, writings |

## How things work

- **Story scroll:** every `[data-progress]` section gets a CSS variable `--p` (0 → 1) from `assets/js/story.js`. Line drawings use `pathLength="1"` and draw with `stroke-dashoffset`; text lines with `data-step` fade in one by one.
- **Timeline:** built automatically from every element with `data-clip`. Use `data-track="life"` for the V2 track, `data-curve="0–11"` for the emotion curve, and `data-tense="present"` for Act III.
- **Projects:** add or edit entries in `assets/js/projects.js`; `/work` renders from it.
- **Reduced motion:** everything becomes a calm, fully visible page.

## Booking a call

Settings live in `assets/js/config.js` (`BOOKING`): French time zone, 08:00–20:00, 30-minute slots, which weekdays, minimum notice.

How requests reach you:
- **Now (no setup):** the visitor's email app opens with the request pre-filled to iamtuhyn@gmail.com.
- **Better (5 minutes, your own account):** create a free form service such as Web3Forms or Formspree with your Gmail, then paste its URL into `endpoint` (and `accessKey` if it gives one). Requests then arrive silently in your inbox.

Note: a slot isn't reserved in a calendar automatically; you confirm by email. For real calendar sync, a Cal.com account could replace this later.

## Generators (in `tools/`)

- `build_images.py`: every web image (masks, screens, mockups, hero panels)
- `make_videos.py`: short screen-flow videos (cursor, click, cut, scroll with pinned header/sidebar) → `assets/video/`
- `build_wall.py`: the hero's sphere-wall thumbnails → `assets/img/wall/` (run after build_images.py)
- `drawings.py`: the pen-style story drawings → `assets/drawings/*.svg.html` (pasted into index.html)
- `resume.py`: the one-page resume → `assets/Joacim-Tuhin-Gain-Resume.pdf` (fonts in `tools/fonts/`, OFL)

## Images

Originals are never touched. Web images are generated into `assets/img/`:

```bash
python3 site/tools/build_images.py
```

It needs Pillow (plus PyMuPDF for the writing covers). `MASKS` in that script hides client logos and names (white-labeling).

## Before publishing: checklist

- [ ] **White-label pass on every screenshot.** Logos are masked on LIM, KPI and mining screens; still check the telecom, insurance, smart-parking and Hub-app screens
- [ ] GridOps screenshots and recordings (white-labeled), plus the product-costing screens
- [ ] Screen recordings for Recyclium and CLM (replace the placeholders)
- [ ] Real numbers for the case studies (`[numbers to add]` markers)
- [ ] LinkedIn URL and CV PDF in the contact section
- [ ] Documentary year for Boroline; your role on the two music videos
- [ ] Life photos (Narikelbari, Dhaka, Hungary, Clermont-Ferrand) to "develop" out of the line drawings
- [ ] Making-of page for "This site is one of them"
- [ ] Hosting (GitHub Pages / Netlify) and a domain

## The intro (first glance)
Shows once per browser (`localStorage` key `frames-intro-seen`): the window draws itself and the intro autoplays (≈4.9 s). The laptop's screen is the real page (top bar, hero, timeline scaled into it), so the zoom ends as the site itself; drawing by `assets/js/intro-engine.js` (copied from `../lab/`). To see it again: scroll up three times at the top of the story page, or clear that key. Code: `assets/js/intro.js`, markup at the top of `index.html`, styles at the end of `story.css`.

## Build tools
Python libraries and ffmpeg live in `../lab/.pylib` (outside the site): `PATH="$PWD/lab/.pylib/ffmpeg:$PATH" PYTHONPATH=lab/.pylib python3 site/tools/build_images.py`. HEIC photos are first converted with macOS `sips` into `lab/photo-jpg`.
