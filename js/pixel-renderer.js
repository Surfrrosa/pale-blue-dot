// Pixel-art space scene: nebula, sparkle stars, parallax flight toward the pale blue dot
// Everything rendered at 320x180 for unified retro look

const PIXEL_FONT = {
  'A': [0,1,0, 1,0,1, 1,1,1, 1,0,1, 1,0,1],
  'B': [1,1,0, 1,0,1, 1,1,0, 1,0,1, 1,1,0],
  'C': [0,1,1, 1,0,0, 1,0,0, 1,0,0, 0,1,1],
  'D': [1,1,0, 1,0,1, 1,0,1, 1,0,1, 1,1,0],
  'E': [1,1,1, 1,0,0, 1,1,0, 1,0,0, 1,1,1],
  'G': [0,1,1, 1,0,0, 1,0,1, 1,0,1, 0,1,1],
  'H': [1,0,1, 1,0,1, 1,1,1, 1,0,1, 1,0,1],
  'I': [1,1,1, 0,1,0, 0,1,0, 0,1,0, 1,1,1],
  'K': [1,0,1, 1,1,0, 1,0,0, 1,1,0, 1,0,1],
  'L': [1,0,0, 1,0,0, 1,0,0, 1,0,0, 1,1,1],
  'N': [1,0,1, 1,1,1, 1,1,1, 1,0,1, 1,0,1],
  'O': [1,1,1, 1,0,1, 1,0,1, 1,0,1, 1,1,1],
  'R': [1,1,0, 1,0,1, 1,1,0, 1,0,1, 1,0,1],
  'T': [1,1,1, 0,1,0, 0,1,0, 0,1,0, 0,1,0],
  'U': [1,0,1, 1,0,1, 1,0,1, 1,0,1, 1,1,1],
  'Y': [1,0,1, 1,0,1, 0,1,0, 0,1,0, 0,1,0],
  '0': [1,1,1, 1,0,1, 1,0,1, 1,0,1, 1,1,1],
  '1': [0,1,0, 1,1,0, 0,1,0, 0,1,0, 1,1,1],
  '2': [1,1,1, 0,0,1, 1,1,1, 1,0,0, 1,1,1],
  '3': [1,1,1, 0,0,1, 1,1,1, 0,0,1, 1,1,1],
  '4': [1,0,1, 1,0,1, 1,1,1, 0,0,1, 0,0,1],
  '5': [1,1,1, 1,0,0, 1,1,1, 0,0,1, 1,1,1],
  '6': [1,1,1, 1,0,0, 1,1,1, 1,0,1, 1,1,1],
  '7': [1,1,1, 0,0,1, 0,1,0, 0,1,0, 0,1,0],
  '8': [1,1,1, 1,0,1, 1,1,1, 1,0,1, 1,1,1],
  '9': [1,1,1, 1,0,1, 1,1,1, 0,0,1, 1,1,1],
  ':': [0,0,0, 0,1,0, 0,0,0, 0,1,0, 0,0,0],
  ' ': [0,0,0, 0,0,0, 0,0,0, 0,0,0, 0,0,0],
};

function drawPixelText(ctx, text, x, y, color, alpha) {
  const charW = 4;
  let cursorX = x - (text.length * charW) / 2;
  ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;

  for (const ch of text) {
    const glyph = PIXEL_FONT[ch];
    if (!glyph) { cursorX += charW; continue; }

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 3; col++) {
        if (glyph[row * 3 + col]) {
          ctx.fillRect(cursorX + col, y + row, 1, 1);
        }
      }
    }
    cursorX += charW;
  }
}

export class PixelRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.pixelWidth = 320;
    this.pixelHeight = 180;

    this.buffer = document.createElement('canvas');
    this.buffer.width = this.pixelWidth;
    this.buffer.height = this.pixelHeight;
    this.bufferCtx = this.buffer.getContext('2d');

    // Pre-render the static nebula background
    this.nebulaCanvas = document.createElement('canvas');
    this.nebulaCanvas.width = this.pixelWidth;
    this.nebulaCanvas.height = this.pixelHeight;
    this.nebulaCtx = this.nebulaCanvas.getContext('2d');

    // The dot position (center of screen)
    this.dotX = Math.floor(this.pixelWidth / 2);
    this.dotY = Math.floor(this.pixelHeight / 2);
    this.dotGlow = 0;
    this.dotVisible = false;

    // Parallax star layers
    this.starLayers = [];
    this.initStars();

    // Cross sparkle stars (the big shiny ones)
    this.sparkles = [];
    this.initSparkles();

    // Nebula dust clouds
    this.nebulaGenerated = false;

    // Scene state
    this.starsOpacity = 0;
    this.nebulaOpacity = 0;
    this.parallaxSpeed = 0;
    this.targetParallaxSpeed = 0;
    this.signOpacity = 0;
    this.signVisible = false;
    this.fadingOut = false;
    this.fadeOutMultiplier = 1;
  }

  initStars() {
    this.starLayers = [];

    // 3 layers with different speeds (closer = faster outward drift)
    const configs = [
      { count: 120, sizeMin: 1, sizeMax: 1, speedMult: 0.3, brightness: 0.4 },
      { count: 60,  sizeMin: 1, sizeMax: 2, speedMult: 0.6, brightness: 0.6 },
      { count: 30,  sizeMin: 1, sizeMax: 2, speedMult: 1.0, brightness: 0.9 },
    ];

    for (const cfg of configs) {
      const stars = [];
      for (let i = 0; i < cfg.count; i++) {
        stars.push(this.createStar(cfg));
      }
      this.starLayers.push({ stars, config: cfg });
    }
  }

  createStar(cfg, fromCenter = false) {
    const cx = this.pixelWidth / 2;
    const cy = this.pixelHeight / 2;

    let x, y;
    if (fromCenter) {
      // Spawn near center and fly outward
      const angle = Math.random() * Math.PI * 2;
      const dist = 5 + Math.random() * 30;
      x = cx + Math.cos(angle) * dist;
      y = cy + Math.sin(angle) * dist;
    } else {
      x = Math.random() * this.pixelWidth;
      y = Math.random() * this.pixelHeight;
    }

    // Angle from center
    const dx = x - cx;
    const dy = y - cy;
    const angle = Math.atan2(dy, dx);
    const dist = Math.sqrt(dx * dx + dy * dy);

    const colors = [
      [200, 210, 230],  // white-blue
      [180, 190, 255],  // blue
      [255, 220, 180],  // warm
      [220, 200, 255],  // lavender
      [255, 200, 200],  // pink-white
    ];

    return {
      x, y, angle, dist,
      size: cfg.sizeMin + Math.floor(Math.random() * (cfg.sizeMax - cfg.sizeMin + 1)),
      brightness: cfg.brightness * (0.5 + Math.random() * 0.5),
      twinkleSpeed: 0.5 + Math.random() * 2.5,
      twinkleOffset: Math.random() * Math.PI * 2,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedMult: cfg.speedMult,
    };
  }

  initSparkles() {
    this.sparkles = [];

    // Big cross-shaped sparkle stars scattered around
    const colors = [
      { core: [120, 180, 255], glow: [60, 100, 200] },   // blue
      { core: [255, 150, 100], glow: [200, 80, 50] },     // orange/red
      { core: [100, 220, 255], glow: [40, 150, 220] },    // cyan
      { core: [200, 160, 255], glow: [140, 80, 220] },    // purple
      { core: [255, 255, 200], glow: [200, 200, 100] },   // yellow-white
    ];

    for (let i = 0; i < 12; i++) {
      const cx = this.pixelWidth / 2;
      const cy = this.pixelHeight / 2;
      let x, y;
      // Keep sparkles away from the very center (dot's territory)
      do {
        x = 10 + Math.random() * (this.pixelWidth - 20);
        y = 10 + Math.random() * (this.pixelHeight - 20);
      } while (Math.abs(x - cx) < 30 && Math.abs(y - cy) < 20);

      const dx = x - cx;
      const dy = y - cy;

      const colorSet = colors[Math.floor(Math.random() * colors.length)];

      this.sparkles.push({
        x, y,
        angle: Math.atan2(dy, dx),
        dist: Math.sqrt(dx * dx + dy * dy),
        armLength: 2 + Math.floor(Math.random() * 4), // 2-5 pixels
        pulseSpeed: 0.8 + Math.random() * 1.5,
        pulseOffset: Math.random() * Math.PI * 2,
        core: colorSet.core,
        glow: colorSet.glow,
        speedMult: 0.5 + Math.random() * 0.5,
      });
    }
  }

  generateNebula() {
    if (this.nebulaGenerated) return;
    this.nebulaGenerated = true;

    const ctx = this.nebulaCtx;
    const w = this.pixelWidth;
    const h = this.pixelHeight;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;

    // Generate nebula using layered noise
    // Multiple cloud layers with different colors
    const clouds = [
      { cx: 0.3, cy: 0.4, rx: 0.4, ry: 0.5, r: 40, g: 15, b: 60, strength: 0.7 },   // deep purple
      { cx: 0.7, cy: 0.6, rx: 0.35, ry: 0.4, r: 15, g: 20, b: 55, strength: 0.6 },   // dark blue
      { cx: 0.5, cy: 0.3, rx: 0.3, ry: 0.25, r: 50, g: 20, b: 70, strength: 0.5 },   // magenta
      { cx: 0.2, cy: 0.7, rx: 0.25, ry: 0.3, r: 20, g: 30, b: 60, strength: 0.4 },   // blue
      { cx: 0.8, cy: 0.3, rx: 0.2, ry: 0.25, r: 60, g: 15, b: 50, strength: 0.35 },  // pink-purple
      { cx: 0.5, cy: 0.5, rx: 0.5, ry: 0.5, r: 10, g: 8, b: 25, strength: 0.3 },     // overall tint
    ];

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const idx = (y * w + x) * 4;

        let r = 5, g = 5, b = 8; // base deep space

        for (const cloud of clouds) {
          const nx = (x / w - cloud.cx) / cloud.rx;
          const ny = (y / h - cloud.cy) / cloud.ry;
          const d = nx * nx + ny * ny;

          if (d < 1) {
            // Smooth falloff with noise
            const falloff = 1 - Math.sqrt(d);
            const noise = 0.7 + 0.3 * Math.sin(x * 0.3 + y * 0.2) * Math.cos(x * 0.15 - y * 0.25);
            const intensity = falloff * falloff * cloud.strength * noise;

            r += cloud.r * intensity;
            g += cloud.g * intensity;
            b += cloud.b * intensity;
          }
        }

        // Add fine pixel noise for texture
        const noise = (Math.random() - 0.5) * 8;
        r = Math.max(0, Math.min(255, Math.floor(r + noise)));
        g = Math.max(0, Math.min(255, Math.floor(g + noise)));
        b = Math.max(0, Math.min(255, Math.floor(b + noise)));

        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  setDotGlow(intensity) {
    this.dotGlow = intensity;
  }

  showStars() {
    this.starsOpacity = 0.01;
  }

  showNebula() {
    this.generateNebula();
    this.nebulaOpacity = 0.01;
  }

  showDot() {
    this.dotVisible = true;
  }

  showSign() {
    this.signVisible = true;
  }

  startParallax() {
    this.targetParallaxSpeed = 1;
  }

  fadeToBlack() {
    this.fadingOut = true;
  }

  resizeOutput() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  render(time) {
    const ctx = this.bufferCtx;
    const w = this.pixelWidth;
    const h = this.pixelHeight;
    const cx = w / 2;
    const cy = h / 2;

    if (this.fadingOut) {
      this.fadeOutMultiplier = Math.max(0, this.fadeOutMultiplier - 0.005);
    }
    if (this.starsOpacity > 0 && this.starsOpacity < 1) {
      this.starsOpacity = Math.min(this.starsOpacity + 0.004, 1);
    }
    if (this.nebulaOpacity > 0 && this.nebulaOpacity < 1) {
      this.nebulaOpacity = Math.min(this.nebulaOpacity + 0.003, 1);
    }
    const starsAlpha = this.starsOpacity * this.fadeOutMultiplier;
    const nebulaAlpha = this.nebulaOpacity * this.fadeOutMultiplier;
    this.parallaxSpeed += (this.targetParallaxSpeed - this.parallaxSpeed) * 0.01;

    // --- Deep space base ---
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, w, h);

    // --- Nebula background ---
    if (nebulaAlpha > 0) {
      ctx.globalAlpha = nebulaAlpha;
      ctx.drawImage(this.nebulaCanvas, 0, 0);
      ctx.globalAlpha = 1;
    }

    // --- Stars (parallax outward from center) ---
    if (starsAlpha > 0) {
      for (const layer of this.starLayers) {
        for (let i = 0; i < layer.stars.length; i++) {
          const star = layer.stars[i];

          // Move outward from center
          if (this.parallaxSpeed > 0) {
            star.dist += star.speedMult * this.parallaxSpeed * 0.15;

            // Recalculate position from angle and distance
            star.x = cx + Math.cos(star.angle) * star.dist;
            star.y = cy + Math.sin(star.angle) * star.dist;

            // If star goes off screen, respawn near center
            if (star.x < -5 || star.x > w + 5 || star.y < -5 || star.y > h + 5) {
              const newStar = this.createStar(layer.config, true);
              layer.stars[i] = newStar;
              continue;
            }
          }

          // Twinkle
          const twinkle = 0.5 + 0.5 * Math.sin(time * 0.001 * star.twinkleSpeed + star.twinkleOffset);
          const alpha = star.brightness * (0.3 + twinkle * 0.7) * starsAlpha;
          if (alpha < 0.05) continue;

          const [r, g, b] = star.color;
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
          ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.size, star.size);
        }
      }
    }

    // --- Cross sparkle stars ---
    if (starsAlpha > 0.3) {
      for (let i = 0; i < this.sparkles.length; i++) {
        const sp = this.sparkles[i];

        // Parallax movement
        if (this.parallaxSpeed > 0) {
          sp.dist += sp.speedMult * this.parallaxSpeed * 0.12;
          sp.x = cx + Math.cos(sp.angle) * sp.dist;
          sp.y = cy + Math.sin(sp.angle) * sp.dist;

          if (sp.x < -10 || sp.x > w + 10 || sp.y < -10 || sp.y > h + 10) {
            // Respawn
            const angle = Math.random() * Math.PI * 2;
            const dist = 20 + Math.random() * 40;
            sp.x = cx + Math.cos(angle) * dist;
            sp.y = cy + Math.sin(angle) * dist;
            sp.angle = angle;
            sp.dist = dist;
            continue;
          }
        }

        const pulse = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(time * 0.001 * sp.pulseSpeed + sp.pulseOffset));
        const sparkleAlpha = pulse * starsAlpha;

        const px = Math.floor(sp.x);
        const py = Math.floor(sp.y);

        // Core pixel
        const [cr, cg, cb] = sp.core;
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${sparkleAlpha})`;
        ctx.fillRect(px, py, 1, 1);

        // Cross arms
        const [gr, gg, gb] = sp.glow;
        const armLen = Math.ceil(sp.armLength * pulse);

        for (let d = 1; d <= armLen; d++) {
          const armAlpha = sparkleAlpha * (1 - d / (armLen + 1)) * 0.7;
          ctx.fillStyle = `rgba(${gr}, ${gg}, ${gb}, ${armAlpha})`;
          // Vertical
          ctx.fillRect(px, py - d, 1, 1);
          ctx.fillRect(px, py + d, 1, 1);
          // Horizontal
          ctx.fillRect(px - d, py, 1, 1);
          ctx.fillRect(px + d, py, 1, 1);
        }

        // Diagonal arms (shorter)
        const diagLen = Math.ceil(armLen * 0.5);
        for (let d = 1; d <= diagLen; d++) {
          const armAlpha = sparkleAlpha * (1 - d / (diagLen + 1)) * 0.4;
          ctx.fillStyle = `rgba(${gr}, ${gg}, ${gb}, ${armAlpha})`;
          ctx.fillRect(px - d, py - d, 1, 1);
          ctx.fillRect(px + d, py - d, 1, 1);
          ctx.fillRect(px - d, py + d, 1, 1);
          ctx.fillRect(px + d, py + d, 1, 1);
        }
      }
    }

    // --- The Pale Blue Dot ---
    if (this.dotVisible) {
      const dotAlpha = Math.min(nebulaAlpha * 1.5, 1);

      // Very subtle, soft halo (just enough to distinguish from black space)
      const breathe = 0.03 + 0.02 * Math.sin(time * 0.0005); // slow, gentle
      ctx.fillStyle = `rgba(77, 201, 246, ${breathe * dotAlpha})`;
      ctx.fillRect(this.dotX - 1, this.dotY, 1, 1);
      ctx.fillRect(this.dotX + 1, this.dotY, 1, 1);
      ctx.fillRect(this.dotX, this.dotY - 1, 1, 1);
      ctx.fillRect(this.dotX, this.dotY + 1, 1, 1);

      // The dot itself: one steady pale blue pixel
      ctx.fillStyle = `rgba(90, 180, 220, ${dotAlpha * 0.9})`;
      ctx.fillRect(this.dotX, this.dotY, 1, 1);

      // --- "YOU ARE HERE" sign ---
      if (this.signVisible) {
        if (this.signOpacity < 1) {
          this.signOpacity = Math.min(this.signOpacity + 0.008, 1);
        }
        const signAlpha = dotAlpha * 0.85 * this.signOpacity;

        if (signAlpha > 0.01) {
          const bounce = Math.floor(Math.sin(time * 0.003) * 1.5);
          const arrowBaseY = this.dotY - 10 + bounce;

          // Small downward-pointing arrow
          const arrowColor = [224, 195, 108]; // amber
          ctx.fillStyle = `rgba(${arrowColor[0]}, ${arrowColor[1]}, ${arrowColor[2]}, ${signAlpha})`;
          // Pixel-art block arrow pointing down
          const ax = this.dotX;
          const ay = arrowBaseY;
          // Shaft (3px wide, 4px tall)
          ctx.fillRect(ax - 1, ay, 3, 4);
          // Arrow head (5px wide, 3px tall)
          ctx.fillRect(ax - 2, ay + 4, 5, 1);
          ctx.fillRect(ax - 1, ay + 5, 3, 1);
          ctx.fillRect(ax, ay + 6, 1, 1);

          // "YOU ARE HERE" text above the arrow
          const textY = arrowBaseY - 7;
          drawPixelText(ctx, 'YOU ARE HERE', this.dotX, textY, arrowColor, signAlpha);
        }
      }
    }

    // --- Scale to full screen ---
    const outCtx = this.ctx;
    outCtx.imageSmoothingEnabled = false;
    outCtx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    const scaleX = this.canvas.width / w;
    const scaleY = this.canvas.height / h;
    const scale = Math.max(scaleX, scaleY);
    const dw = w * scale;
    const dh = h * scale;
    const dx = (this.canvas.width - dw) / 2;
    const dy = (this.canvas.height - dh) / 2;

    outCtx.drawImage(this.buffer, dx, dy, dw, dh);
  }
}
