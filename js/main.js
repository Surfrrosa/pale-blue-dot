import { PixelRenderer } from './pixel-renderer.js';
import { CRTEffects } from './crt-effects.js';
import { AudioPlayer } from './audio-player.js';
import { ReadMode } from './read-mode.js';

const state = {
  phase: 0,
  phaseTime: 0,
  bootLines: [
    'VOYAGER DEEP SPACE NETWORK',
    '',
    'SIGNAL ACQUIRED',
    'DISTANCE: 6.06 BILLION KM',
    '',
    'PROCESSING IMAGE DATA...',
  ],
  bootIndex: 0,
  bootCharIndex: 0,
  bootText: '',
  lastBootTick: 0,
};

const sceneCanvas = document.getElementById('scene');
const pixelRenderer = new PixelRenderer(sceneCanvas);
const crtEffects = new CRTEffects(document.getElementById('crt-effects'));
const audioPlayer = new AudioPlayer();
const readMode = new ReadMode();

const bootScreen = document.getElementById('boot-screen');
const bootTextEl = document.getElementById('boot-text');
const infoBtn = document.getElementById('info-btn');
const aboutPanel = document.getElementById('about-panel');
const aboutClose = document.getElementById('about-close');

// --- About panel ---
infoBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  aboutPanel.classList.add('open');
});

aboutClose.addEventListener('click', () => {
  aboutPanel.classList.remove('open');
});

// Close about panel on click outside
document.addEventListener('click', (e) => {
  if (aboutPanel.classList.contains('open') &&
      !aboutPanel.contains(e.target) &&
      e.target !== infoBtn) {
    aboutPanel.classList.remove('open');
  }
});

// --- Sizing ---
function resize() {
  pixelRenderer.resizeOutput();
  crtEffects.resize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', resize);

// --- Boot sequence ---
function updateBoot(time) {
  if (state.bootIndex >= state.bootLines.length) {
    document.getElementById('boot-cursor').style.display = 'none';
    bootScreen.classList.add('fade-out');
    setTimeout(() => {
      bootScreen.classList.add('hidden');
      startPhase1(performance.now());
    }, 1000);
    state.phase = -1;
    return;
  }

  const charDelay = 40;
  if (time - state.lastBootTick > charDelay) {
    state.lastBootTick = time;
    const currentLine = state.bootLines[state.bootIndex];

    if (state.bootCharIndex < currentLine.length) {
      state.bootText += currentLine[state.bootCharIndex];
      state.bootCharIndex++;
    } else {
      state.bootIndex++;
      state.bootCharIndex = 0;
      if (state.bootIndex < state.bootLines.length) {
        state.bootText += '\n';
      }
    }

    bootTextEl.textContent = state.bootText;
  }
}

function startPhase1(time) {
  state.phase = 1;
  state.phaseTime = time;
  pixelRenderer.showStars();
}

function startPhase2(time) {
  state.phase = 2;
  state.phaseTime = time;
  pixelRenderer.showNebula();
  pixelRenderer.showDot();
}

function startPhase3(time) {
  state.phase = 3;
  state.phaseTime = time;
  pixelRenderer.startParallax();
  pixelRenderer.showSign();
  audioPlayer.show();

  // Show info button
  infoBtn.classList.remove('hidden');
  infoBtn.classList.add('visible');
}

audioPlayer.onPlay(() => {
  state.phase = 4;
});

audioPlayer.onEnd(() => {
  // Fade the scene to black (canvas keeps rendering base color + CRT effects)
  pixelRenderer.fadeToBlack();

  // Hide the bottom UI
  const bottomUI = document.getElementById('bottom-ui');
  bottomUI.classList.remove('visible');
  bottomUI.classList.add('hidden');

  // After scene fades (~3.5s), show the end text
  setTimeout(() => {
    const endScreen = document.getElementById('end-screen');
    endScreen.classList.remove('hidden');
    requestAnimationFrame(() => {
      endScreen.classList.add('visible');
    });
  }, 3500);
});

function init() {
  resize();
  state.phase = 0;
  requestAnimationFrame(loop);
}

function loop(time) {
  requestAnimationFrame(loop);

  if (state.phase === 0) {
    updateBoot(time);
  } else if (state.phase === 1) {
    if (time - state.phaseTime > 2500) startPhase2(time);
  } else if (state.phase === 2) {
    if (time - state.phaseTime > 5000) startPhase3(time);
  }

  const basePulse = 0.3 + 0.25 * Math.sin(time * 0.0008);
  const audioPulse = state.phase === 4 ? audioPlayer.getAmplitude() * 0.4 : 0;
  pixelRenderer.setDotGlow(basePulse + audioPulse);
  pixelRenderer.render(time);

  crtEffects.render(time);
  audioPlayer.update();
}

init();
