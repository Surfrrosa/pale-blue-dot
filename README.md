# Pale Blue Dot

An interactive pixel-art tribute to Carl Sagan's Pale Blue Dot speech and the Voyager 1 photograph.

**[Live site](https://pale-blue-dot.vercel.app)** (update URL after deploy)

## What it is

A single-page web experience that renders a procedural 8-bit space scene at 320x180 pixels, scaled to fill the viewport with crisp nearest-neighbor interpolation. Stars drift outward in parallax layers, nebula clouds glow in deep purple and blue, and one quiet, steady pixel sits at the center of it all.

The boot sequence types out a transmission from the Voyager Deep Space Network. Then the stars appear, the nebula fades in, and a small amber sign points to the dot: YOU ARE HERE.

Press play to hear Sagan read the excerpt. Press the book icon to read it as RPG-style dialogue, typed out one passage at a time.

## Tech

Pure HTML, CSS, and vanilla JavaScript. No framework, no build step. Canvas API for all rendering.

- **Pixel renderer** -- procedural starfield, nebula, sparkle stars, and the dot, all drawn pixel-by-pixel at 320x180
- **CRT effects** -- scanlines (CSS), vignette (CSS), film grain and chromatic aberration (canvas)
- **Parallax** -- 3 star layers plus sparkle stars drift outward from center
- **Audio** -- HTML5 Audio with custom styled controls
- **Read mode** -- RPG-style typewriter dialogue for accessibility
- **About panel** -- sliding panel with credits and context

## File structure

```
pale-blue-dot/
  index.html              Single HTML page
  css/style.css           All styles
  js/
    main.js               Orchestrator, boot sequence, phase timing
    pixel-renderer.js     Procedural pixel-art scene (320x180 buffer)
    crt-effects.js        Film grain, chromatic aberration, flicker
    audio-player.js       Custom audio controls with drag-to-seek
    read-mode.js          RPG dialogue typewriter for the speech text
  assets/
    pale-blue-dot.png     Voyager 1 source photo (NASA, public domain)
    audio/
      pale-blue-dot.mp3   Carl Sagan reading the excerpt
  vercel.json             Deployment config
```

## Run locally

```bash
npx serve .
```

Open http://localhost:3000.

## Deploy

Static site. Works on Vercel, Netlify, GitHub Pages, or any static host.

## Credits

- **Speech and text:** Carl Sagan, *Pale Blue Dot: A Vision of the Human Future in Space*, 1994
- **Photograph:** NASA / JPL-Caltech / Voyager 1, February 14, 1990
- **Built by:** [Shaina Pauley](https://shainapauley.com)

## License

MIT
