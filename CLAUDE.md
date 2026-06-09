# Pale Blue Dot

An interactive pixel-art tribute to Carl Sagan's *Pale Blue Dot* and the
Voyager 1 photograph (1990-02-14). Vanilla HTML / CSS / JavaScript.
No build step. No dependencies. No framework.

Hosted at [palebluedot.sh](https://palebluedot.sh).

## Project layout

```
index.html        Single page entry
404.html          Static 404
css/style.css     All styles (single file)
js/
  main.js           Boot sequence + animation loop + phase transitions
  pixel-renderer.js Procedural starfield, nebula, parallax, dot rendering (Canvas API)
  crt-effects.js    Scanlines, vignette, film grain, chromatic aberration
  audio-player.js   Carl Sagan audio with progress UI
  read-mode.js      RPG-style typewriter dialogue for the transcript
assets/audio/     Sagan recording (mp3)
favicon.png       Favicon + apple-touch-icon
og-image.png      Social share card
robots.txt        Standard
sitemap.xml       Standard
vercel.json       Vercel deploy config
```

## Running

There is no build step. Open `index.html` in a browser, or serve the
directory with any static server:

```bash
python3 -m http.server 8080
# then visit http://localhost:8080
```

## Architecture

The experience is a four-phase sequence driven by `main.js`'s
`requestAnimationFrame` loop:

- **Phase 0** — boot screen typewriter ("VOYAGER DEEP SPACE NETWORK…")
- **Phase 1** — starfield reveal
- **Phase 2** — nebula + dot reveal
- **Phase 3** — sign reveal ("YOU ARE HERE"), audio controls appear,
  parallax begins
- **Phase 4** — Sagan audio playing, dot pulses with the simulated
  audio waveform
- **End** — scene fades to black, final message displays

Renderers are stateful classes instantiated once at startup
(`PixelRenderer`, `CRTEffects`, `AudioPlayer`, `ReadMode`). Each takes a
`<canvas>` or DOM root and exposes start/show methods invoked from the
phase transitions in `main.js`.

## Conventions

- Single-file CSS (`css/style.css`). All styles, all responsive rules.
- All JS files are ES modules. Imported with `<script type="module">`.
- All buttons have explicit `aria-label`. All non-decorative imagery
  has alt text or is excluded from the a11y tree.
- The page respects `prefers-reduced-motion`: a CSS rule kills CSS
  animations + transitions; `js/main.js` also reads
  `matchMedia('(prefers-reduced-motion: reduce)').matches` and skips
  the parallax loop and the dot-glow pulse when set.
- No frameworks, no build step, no transpilation. If you're tempted
  to add one, don't.

## Audio + content credits

- Audio: Carl Sagan, 1994 reading of the *Pale Blue Dot* passage.
- Photograph: NASA / JPL-Caltech / Voyager 1
  ([source](https://photojournal.jpl.nasa.gov/catalog/PIA00452)).

## Deployment

Pushes to `main` deploy to Vercel automatically. The static files are
served as-is.
