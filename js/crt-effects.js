export class CRTEffects {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.grainCanvas = document.createElement('canvas');
    this.grainCtx = this.grainCanvas.getContext('2d');
    this.lastGrainUpdate = 0;
    this.grainInterval = 1000 / 12; // 12fps grain
    this.flickerPhase = 0;
  }

  resize(width, height) {
    this.canvas.width = width;
    this.canvas.height = height;
    // Grain at half resolution for performance
    this.grainCanvas.width = Math.floor(width / 2);
    this.grainCanvas.height = Math.floor(height / 2);
  }

  updateGrain(time) {
    if (time - this.lastGrainUpdate < this.grainInterval) return;
    this.lastGrainUpdate = time;

    const ctx = this.grainCtx;
    const w = this.grainCanvas.width;
    const h = this.grainCanvas.height;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 9; // Very low opacity (~3.5%)
    }

    ctx.putImageData(imageData, 0, 0);
  }

  render(time) {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;

    ctx.clearRect(0, 0, w, h);

    // Film grain
    this.updateGrain(time);
    ctx.globalCompositeOperation = 'screen';
    ctx.drawImage(this.grainCanvas, 0, 0, w, h);

    // Chromatic aberration (subtle RGB shift)
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.03;

    // Red channel shift right
    ctx.fillStyle = '#ff0000';
    ctx.fillRect(1, 0, w, h);

    // Blue channel shift left
    ctx.fillStyle = '#0000ff';
    ctx.fillRect(-1, 0, w, h);

    ctx.globalAlpha = 1;

    // Slow brightness flicker
    this.flickerPhase += 0.008;
    const flickerAmount = 0.02 + 0.02 * Math.sin(this.flickerPhase * 3.7) + 0.01 * Math.sin(this.flickerPhase * 7.3);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = `rgba(0, 0, 0, ${flickerAmount})`;
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
  }
}
