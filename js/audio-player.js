export class AudioPlayer {
  constructor() {
    this.audio = document.getElementById('audio');
    this.bottomUI = document.getElementById('bottom-ui');
    this.playBtn = document.getElementById('play-btn');
    this.playIcon = document.getElementById('play-icon');
    this.progressContainer = document.getElementById('progress-container');
    this.progressBar = document.getElementById('progress-bar');
    this.timeDisplay = document.getElementById('time-display');
    this.playing = false;
    this.dragging = false;
    this.lastDisplayedSecond = -1;
    this.onPlayCallback = null;
    this.onEndCallback = null;

    this.setupEvents();
  }

  setupEvents() {
    this.playBtn.addEventListener('click', () => this.toggle());

    this.progressContainer.addEventListener('click', (e) => {
      this.seekTo(e.clientX);
    });

    this.progressContainer.addEventListener('mousedown', (e) => {
      this.dragging = true;
      this.seekTo(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (this.dragging) this.seekTo(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      this.dragging = false;
    });

    this.progressContainer.addEventListener('touchstart', (e) => {
      this.dragging = true;
      this.seekTo(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (this.dragging) this.seekTo(e.touches[0].clientX);
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.dragging = false;
    });

    this.audio.addEventListener('ended', () => {
      this.playing = false;
      this.playIcon.innerHTML = '&#9654;';
      if (this.onEndCallback) this.onEndCallback();
    });
  }

  seekTo(clientX) {
    const rect = this.progressContainer.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    if (this.audio.duration) {
      this.audio.currentTime = pct * this.audio.duration;
    }
  }

  toggle() {
    if (this.playing) {
      this.audio.pause();
      this.playing = false;
      this.playIcon.innerHTML = '&#9654;';
    } else {
      this.audio.play();
      this.playing = true;
      this.playIcon.innerHTML = '&#9646;&#9646;';
      if (this.onPlayCallback) this.onPlayCallback();
    }
  }

  onPlay(cb) {
    this.onPlayCallback = cb;
  }

  onEnd(cb) {
    this.onEndCallback = cb;
  }

  show() {
    this.bottomUI.classList.remove('hidden');
    this.bottomUI.classList.add('visible');
  }

  update() {
    if (!this.audio.duration) return;

    const pct = (this.audio.currentTime / this.audio.duration) * 100;
    this.progressBar.style.width = pct + '%';

    const t = Math.floor(this.audio.currentTime);
    if (t !== this.lastDisplayedSecond) {
      this.lastDisplayedSecond = t;
      const m = Math.floor(t / 60);
      const s = t % 60;
      this.timeDisplay.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
  }

  getSimulatedPulse() {
    if (!this.playing) return 0;
    const t = this.audio.currentTime;
    return 0.3 + 0.3 * Math.sin(t * 1.5) + 0.2 * Math.sin(t * 0.7);
  }
}
