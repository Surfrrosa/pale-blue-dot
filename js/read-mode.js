// RPG-style dialogue read mode for the Pale Blue Dot speech

const PARAGRAPHS = [
  "Look again at that dot. That's here. That's home. That's us.",

  "On it everyone you love, everyone you know, everyone you ever heard of, every human being who ever was, lived out their lives.",

  "The aggregate of our joy and suffering, thousands of confident religions, ideologies, and economic doctrines, every hunter and forager, every hero and coward, every creator and destroyer of civilization, every king and peasant, every young couple in love...",

  "...every mother and father, hopeful child, inventor and explorer, every teacher of morals, every corrupt politician, every superstar, every supreme leader, every saint and sinner in the history of our species lived there -- on a mote of dust suspended in a sunbeam.",

  "The Earth is a very small stage in a vast cosmic arena.",

  "Think of the rivers of blood spilled by all those generals and emperors so that, in glory and triumph, they could become the momentary masters of a fraction of a dot.",

  "Think of the endless cruelties visited by the inhabitants of one corner of this pixel on the scarcely distinguishable inhabitants of some other corner...",

  "...how frequent their misunderstandings, how eager they are to destroy each other, how fervent their hatreds.",

  "Our posturings, our imagined self-importance, the delusion that we have some privileged position in the Universe, are challenged by this point of pale light.",

  "Our planet is a lonely speck in the great enveloping cosmic dark. In our obscurity, in all this vastness, there is no hint that help will come from elsewhere to save us from ourselves.",

  "The Earth is the only world known so far to harbor life. There is nowhere else, at least in the near future, to which our species could migrate.",

  "Visit, yes. Settle, not yet. Like it or not, for the moment the Earth is where we make our stand.",

  "It has been said that astronomy is a humbling and character-building experience. There is perhaps no better demonstration of the folly of human conceits than this distant image of our tiny world.",

  "To me, it underscores our responsibility to deal more kindly with one another, and to preserve and cherish the pale blue dot, the only home we've ever known.",

  "-- Carl Sagan, 1994",
];

export class ReadMode {
  constructor() {
    this.overlay = document.getElementById('read-overlay');
    this.textEl = document.getElementById('read-text');
    this.promptEl = document.getElementById('read-prompt');
    this.closeBtn = document.getElementById('read-close');
    this.readBtn = document.getElementById('read-btn');

    this.active = false;
    this.currentIndex = 0;
    this.typing = false;
    this.fullText = '';
    this.displayedLength = 0;
    this.lastCharTime = 0;
    this.charDelay = 30; // ms per character
    this.lastAdvanceTime = 0;

    this.setupEvents();
  }

  setupEvents() {
    this.readBtn.addEventListener('click', () => this.open());
    this.closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.close();
    });

    // Only Space and Enter to advance (not all keys)
    document.addEventListener('keydown', (e) => {
      if (!this.active) return;
      if (e.key === 'Escape') { this.close(); return; }
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        this.advance();
      }
    });

    // Click on overlay to advance
    this.overlay.addEventListener('click', (e) => {
      if (!this.active) return;
      if (e.target === this.closeBtn || this.closeBtn.contains(e.target)) return;
      this.advance();
    });
  }

  open() {
    this.active = true;
    this.currentIndex = 0;
    this.overlay.classList.remove('hidden');
    this.overlay.classList.add('visible');
    this.startParagraph();
  }

  close() {
    this.active = false;
    this.overlay.classList.remove('visible');
    this.overlay.classList.add('hidden');
    this.typing = false;
    this.textEl.textContent = '';
  }

  advance() {
    // Debounce rapid clicks
    const now = performance.now();
    if (now - this.lastAdvanceTime < 200) return;
    this.lastAdvanceTime = now;

    if (this.typing) {
      // Skip to full paragraph
      this.typing = false;
      this.textEl.textContent = this.fullText;
      this.promptEl.style.display = 'block';
      return;
    }

    // Next paragraph
    this.currentIndex++;
    if (this.currentIndex >= PARAGRAPHS.length) {
      this.close();
      return;
    }

    this.startParagraph();
  }

  startParagraph() {
    this.fullText = PARAGRAPHS[this.currentIndex];
    this.displayedLength = 0;
    this.typing = true;
    this.lastCharTime = performance.now();
    this.textEl.textContent = '';
    this.promptEl.style.display = 'none';

    this.typeLoop();
  }

  typeLoop() {
    if (!this.typing || !this.active) return;

    const now = performance.now();
    if (now - this.lastCharTime >= this.charDelay) {
      this.displayedLength++;
      this.lastCharTime = now;

      if (this.displayedLength >= this.fullText.length) {
        // Done typing
        this.textEl.textContent = this.fullText;
        this.typing = false;
        this.promptEl.style.display = 'block';
        return;
      }

      this.textEl.textContent = this.fullText.substring(0, this.displayedLength);
    }

    requestAnimationFrame(() => this.typeLoop());
  }
}
