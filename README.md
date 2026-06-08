# Covetrus Presentation Builder

A self-contained, on-brand deck builder. Employees pick from 13 Covetrus slide
layouts, edit text/icons/images/chart data inline, then present or export — every
deck stays on brand. No backend, no build step, no external dependencies.

## What's in here

```
index.html            ← the app (open this)
slide-styles.css      ← brand slide styles + embedded Mulish font
library.js            ← icon list, image gallery, slide definitions
components.jsx        ← editing primitives + asset pickers
slides.jsx            ← the 13 slide renderers
app.jsx               ← builder shell (rail, canvas, inspector, present, export)
assets/               ← Covetrus logos, brand icons, Mulish.ttf
vendor/               ← React, Babel, PptxGenJS, html-to-image (vendored)
```

Everything loads from local files, so the site works behind a firewall and offline.

## Deploy to GitHub Pages

1. Create a repo (e.g. `presentation-builder`).
2. Put the contents of this folder at the repo root.
3. Push:
   ```bash
   git init && git add . && git commit -m "Presentation builder"
   git branch -M main
   git remote add origin https://github.com/<org>/<repo>.git
   git push -u origin main
   ```
4. Repo → **Settings → Pages → Source: `main` / root → Save**.
5. Live at `https://<org>.github.io/<repo>/` in ~1 minute.

## Other static hosts

Drag this folder onto **Netlify Drop** (app.netlify.com/drop), or deploy with
**Vercel** / **Cloudflare Pages** / any S3 + static website bucket. The entry
point is `index.html`.

## Notes

- Decks auto-save to the browser (localStorage) and can be shared via the
  "Share link" button, which encodes the deck into the URL.
- PPTX/PDF export renders each slide as a high-resolution image (pixel-perfect,
  not editable text in PowerPoint).
- Designed for desktop screens.
