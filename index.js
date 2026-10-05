/**
 * DICE DUEL PRO - Game Logic & Interactive Systems
 * Includes Web Audio Sound Engine, Canvas Confetti, and State Management.
 */

// ==========================================
// 1. STATE MANAGEMENT
// ==========================================
const state = {
  p1Score: 0,
  p2Score: 0,
  drawsCount: 0,
  roundsCount: 0,
  targetWins: 3, // Default first to 3
  isRolling: false,
  soundEnabled: true,
  p1Name: "Player 1",
  p2Name: "Player 2",
  currentEditingPlayer: 1,
  history: []
};

// ==========================================
// 2. DOM ELEMENTS
// ==========================================
const elements = {
  // Dice Images & Containers
  img1: document.getElementById("img1"),
  img2: document.getElementById("img2"),
  dice1Wrapper: document.getElementById("dice1-wrapper"),
  dice2Wrapper: document.getElementById("dice2-wrapper"),
  val1Display: document.getElementById("val1"),
  val2Display: document.getElementById("val2"),
  zoneP1: document.getElementById("zone-p1"),
  zoneP2: document.getElementById("zone-p2"),

  // Status & Scores
  statusBadge: document.getElementById("status-badge"),
  statusText: document.getElementById("status-text"),
  p1ScoreDisplay: document.getElementById("p1-score"),
  p2ScoreDisplay: document.getElementById("p2-score"),
  roundsDisplay: document.getElementById("rounds-count"),
  drawsDisplay: document.getElementById("draws-count"),

  // Player Names
  p1NameDisplay: document.getElementById("p1-name-display"),
  p2NameDisplay: document.getElementById("p2-name-display"),
  p1ArenaName: document.getElementById("p1-arena-name"),
  p2ArenaName: document.getElementById("p2-arena-name"),
  editP1Btn: document.getElementById("edit-p1-btn"),
  editP2Btn: document.getElementById("edit-p2-btn"),

  // Buttons & Controls
  rollBtn: document.getElementById("roll-button"),
  resetBtn: document.getElementById("reset-btn"),
  soundBtn: document.getElementById("sound-btn"),
  modeSelect: document.getElementById("mode-select"),
  soundOnIcon: document.querySelector(".sound-on-icon"),
  soundOffIcon: document.querySelector(".sound-off-icon"),

  // History Log
  historyPills: document.getElementById("history-pills"),
  historyCount: document.getElementById("history-count"),

  // Champion Modal
  championModal: document.getElementById("champion-modal"),
  modalTitle: document.getElementById("modal-title"),
  modalDesc: document.getElementById("modal-desc"),
  modalP1Label: document.getElementById("modal-p1-label"),
  modalP2Label: document.getElementById("modal-p2-label"),
  modalP1Score: document.getElementById("modal-p1-score"),
  modalP2Score: document.getElementById("modal-p2-score"),
  modalPlayAgainBtn: document.getElementById("modal-play-again-btn"),

  // Rename Modal
  renameModal: document.getElementById("rename-modal"),
  renameInput: document.getElementById("rename-input"),
  renameSaveBtn: document.getElementById("rename-save-btn"),
  renameCancelBtn: document.getElementById("rename-cancel-btn"),

  // Confetti Canvas
  confettiCanvas: document.getElementById("confetti-canvas")
};

// ==========================================
// 3. SYNTHESIZED WEB AUDIO ENGINE
// ==========================================
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

// Play crisp dice click / clatter sound
function playDiceClickSound() {
  if (!state.soundEnabled || !audioCtx) return;
  try {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(240 + Math.random() * 180, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.04);

    gain.gain.setValueAtTime(0.25, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.04);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.04);
  } catch (e) {
    // Ignore audio errors on unprompted gestures
  }
}

// Play round win sound (bright rising arpeggio)
function playWinSound() {
  if (!state.soundEnabled || !audioCtx) return;
  try {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const startTime = audioCtx.currentTime + idx * 0.08;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + 0.35);
    });
  } catch (e) {}
}

// Play draw sound (dual soft chime)
function playDrawSound() {
  if (!state.soundEnabled || !audioCtx) return;
  try {
    const osc1 = audioCtx.createOscillator();
    const osc2 = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc1.type = "sine";
    osc2.type = "triangle";
    osc1.frequency.setValueAtTime(392, audioCtx.currentTime); // G4
    osc2.frequency.setValueAtTime(440, audioCtx.currentTime); // A4

    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(audioCtx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(audioCtx.currentTime + 0.4);
    osc2.stop(audioCtx.currentTime + 0.4);
  } catch (e) {}
}

// Play tournament champion fanfare
function playChampionFanfare() {
  if (!state.soundEnabled || !audioCtx) return;
  try {
    const melody = [
      { f: 523.25, d: 0.15 }, // C5
      { f: 659.25, d: 0.15 }, // E5
      { f: 783.99, d: 0.18 }, // G5
      { f: 1046.50, d: 0.5 }  // C6
    ];
    let time = audioCtx.currentTime;
    melody.forEach(n => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(n.f, time);

      gain.gain.setValueAtTime(0.3, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + n.d);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(time);
      osc.stop(time + n.d);
      time += n.d;
    });
  } catch (e) {}
}

// ==========================================
// 4. CANVAS CONFETTI ENGINE
// ==========================================
const confetti = {
  particles: [],
  animationId: null,
  ctx: null,

  init() {
    if (!elements.confettiCanvas) return;
    this.ctx = elements.confettiCanvas.getContext("2d");
    this.resize();
    window.addEventListener("resize", () => this.resize());
  },

  resize() {
    if (!elements.confettiCanvas) return;
    elements.confettiCanvas.width = window.innerWidth;
    elements.confettiCanvas.height = window.innerHeight;
  },

  burst(count = 70) {
    this.init();
    if (!this.ctx) return;

    const colors = ["#06b6d4", "#3b82f6", "#ec4899", "#8b5cf6", "#f59e0b", "#10b981", "#ffffff"];
    const width = elements.confettiCanvas.width;

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: width / 2 + (Math.random() - 0.5) * 200,
        y: window.innerHeight * 0.45,
        vx: (Math.random() - 0.5) * 16,
        vy: -Math.random() * 14 - 6,
        size: Math.random() * 8 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 12,
        opacity: 1,
        life: 0
      });
    }

    if (!this.animationId) {
      this.animate();
    }
  },

  animate() {
    this.ctx.clearRect(0, 0, elements.confettiCanvas.width, elements.confettiCanvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.rotation += p.vRot;
      p.life++;

      if (p.life > 40) {
        p.opacity -= 0.02;
      }

      if (p.opacity <= 0 || p.y > elements.confettiCanvas.height) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.opacity);
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.animationId = null;
      this.ctx.clearRect(0, 0, elements.confettiCanvas.width, elements.confettiCanvas.height);
    }
  }
};

// ==========================================
// 5. CORE GAMEPLAY FUNCTIONS
// ==========================================

/**
 * Executes a full dynamic dice roll with realistic tumbling animations and suspense
 */
function rollDice() {
  if (state.isRolling) return;

  initAudio();
  state.isRolling = true;
  elements.rollBtn.disabled = true;

  // Clear previous winner states
  elements.zoneP1.classList.remove("active-winner", "active-loser");
  elements.zoneP2.classList.remove("active-winner", "active-loser");
  elements.statusText.classList.remove("celebrate");

  // Add 3D tumble animations
  elements.dice1Wrapper.classList.add("rolling-dice-1");
  elements.dice2Wrapper.classList.add("rolling-dice-2");

  elements.statusBadge.textContent = "Rolling...";
  elements.statusBadge.style.color = "var(--draw-color)";
  elements.statusBadge.style.borderColor = "var(--draw-glow)";
  elements.statusText.textContent = "Tumbling the dice...";

  let shuffleCount = 0;
  const maxShuffles = 8;
  const shuffleInterval = 75;

  const intervalId = setInterval(() => {
    shuffleCount++;
    const randomTemp1 = Math.floor(Math.random() * 6) + 1;
    const randomTemp2 = Math.floor(Math.random() * 6) + 1;

    elements.img1.src = `images/dice${randomTemp1}.png`;
    elements.img2.src = `images/dice${randomTemp2}.png`;
    elements.val1Display.textContent = randomTemp1;
    elements.val2Display.textContent = randomTemp2;

    playDiceClickSound();

    if (shuffleCount >= maxShuffles) {
      clearInterval(intervalId);
      finalizeRoll();
    }
  }, shuffleInterval);
}

/**
 * Calculates results, updates score, triggers celebration
 */
function finalizeRoll() {
  // Stop rolling animations
  elements.dice1Wrapper.classList.remove("rolling-dice-1");
  elements.dice2Wrapper.classList.remove("rolling-dice-2");

  // Determine final random values (1 - 6)
  const p1Value = Math.floor(Math.random() * 6) + 1;
  const p2Value = Math.floor(Math.random() * 6) + 1;

  elements.img1.src = `images/dice${p1Value}.png`;
  elements.img2.src = `images/dice${p2Value}.png`;
  elements.val1Display.textContent = p1Value;
  elements.val2Display.textContent = p2Value;

  state.roundsCount++;
  elements.roundsDisplay.textContent = state.roundsCount;

  let outcome = "";
  let pillClass = "";

  if (p1Value > p2Value) {
    // Player 1 Wins
    state.p1Score++;
    elements.p1ScoreDisplay.textContent = state.p1Score;

    elements.zoneP1.classList.add("active-winner");
    elements.zoneP2.classList.add("active-loser");

    elements.statusBadge.textContent = "Round Winner";
    elements.statusBadge.style.color = "var(--p1-color)";
    elements.statusBadge.style.borderColor = "var(--p1-glow)";
    elements.statusText.textContent = `🚩 ${state.p1Name} Wins!`;
    elements.statusText.classList.add("celebrate");

    outcome = `${state.p1Name} won (${p1Value} vs ${p2Value})`;
    pillClass = "pill-p1";

    playWinSound();
    confetti.burst(50);
  } else if (p2Value > p1Value) {
    // Player 2 Wins
    state.p2Score++;
    elements.p2ScoreDisplay.textContent = state.p2Score;

    elements.zoneP2.classList.add("active-winner");
    elements.zoneP1.classList.add("active-loser");

    elements.statusBadge.textContent = "Round Winner";
    elements.statusBadge.style.color = "var(--p2-color)";
    elements.statusBadge.style.borderColor = "var(--p2-glow)";
    elements.statusText.textContent = `🎯 ${state.p2Name} Wins!`;
    elements.statusText.classList.add("celebrate");

    outcome = `${state.p2Name} won (${p2Value} vs ${p1Value})`;
    pillClass = "pill-p2";

    playWinSound();
    confetti.burst(50);
  } else {
    // Draw
    state.drawsCount++;
    elements.drawsDisplay.textContent = state.drawsCount;

    elements.statusBadge.textContent = "Stalemate";
    elements.statusBadge.style.color = "var(--draw-color)";
    elements.statusBadge.style.borderColor = "var(--draw-glow)";
    elements.statusText.textContent = `🤝 It's a Draw! Both got ${p1Value}`;
    elements.statusText.classList.add("celebrate");

    outcome = `Draw (${p1Value} vs ${p2Value})`;
    pillClass = "pill-draw";

    playDrawSound();
  }

  // Record History
  recordHistory(outcome, pillClass);

  // Check Tournament Championship
  if (state.targetWins > 0) {
    if (state.p1Score >= state.targetWins) {
      showChampionModal(state.p1Name);
    } else if (state.p2Score >= state.targetWins) {
      showChampionModal(state.p2Name);
    }
  }

  state.isRolling = false;
  elements.rollBtn.disabled = false;
}

/**
 * Displays Champion Celebration Modal
 */
function showChampionModal(winnerName) {
  playChampionFanfare();
  confetti.burst(150);

  elements.modalTitle.textContent = `🎉 ${winnerName} is the Champion!`;
  elements.modalDesc.textContent = `First to achieve ${state.targetWins} victories in tournament play!`;
  elements.modalP1Label.textContent = state.p1Name;
  elements.modalP2Label.textContent = state.p2Name;
  elements.modalP1Score.textContent = state.p1Score;
  elements.modalP2Score.textContent = state.p2Score;

  elements.championModal.classList.remove("hidden");
}

/**
 * Adds an item to the recent rolls history pills
 */
function recordHistory(text, pillClass) {
  state.history.unshift({ text, pillClass });
  if (state.history.length > 8) state.history.pop();

  elements.historyCount.textContent = `${state.roundsCount} played`;
  elements.historyPills.innerHTML = state.history
    .map(
      item => `<div class="history-pill ${item.pillClass}">
        <span>${item.text}</span>
      </div>`
    )
    .join("");
}

/**
 * Resets all scores and round logs
 */
function resetGame(fullReset = true) {
  state.p1Score = 0;
  state.p2Score = 0;
  state.drawsCount = 0;
  state.roundsCount = 0;
  state.history = [];

  elements.p1ScoreDisplay.textContent = "0";
  elements.p2ScoreDisplay.textContent = "0";
  elements.roundsDisplay.textContent = "0";
  elements.drawsDisplay.textContent = "0";
  elements.val1Display.textContent = "6";
  elements.val2Display.textContent = "6";
  elements.img1.src = "images/dice6.png";
  elements.img2.src = "images/dice6.png";

  elements.zoneP1.classList.remove("active-winner", "active-loser");
  elements.zoneP2.classList.remove("active-winner", "active-loser");

  elements.statusBadge.textContent = "Ready to Play";
  elements.statusBadge.style.color = "var(--text-muted)";
  elements.statusBadge.style.borderColor = "var(--surface-border)";
  elements.statusText.textContent = "Roll the dice to start!";
  elements.statusText.classList.remove("celebrate");

  elements.historyCount.textContent = "0 recorded";
  elements.historyPills.innerHTML = `<div class="empty-history-text">Roll the dice to see match history here...</div>`;

  elements.championModal.classList.add("hidden");
}

// Backward compatibility function
function refresh() {
  rollDice();
}

// ==========================================
// 6. EVENT LISTENERS & USER CUSTOMIZATION
// ==========================================
function setupEventListeners() {
  // Roll Button
  elements.rollBtn.addEventListener("click", () => {
    rollDice();
  });

  // Spacebar hotkey
  window.addEventListener("keydown", (e) => {
    if (e.code === "Space" && e.target.tagName !== "INPUT") {
      e.preventDefault();
      rollDice();
    }
  });

  // Reset Button
  elements.resetBtn.addEventListener("click", () => {
    resetGame();
  });

  // Sound Toggle Button
  elements.soundBtn.addEventListener("click", () => {
    initAudio();
    state.soundEnabled = !state.soundEnabled;
    elements.soundOnIcon.classList.toggle("hidden", !state.soundEnabled);
    elements.soundOffIcon.classList.toggle("hidden", state.soundEnabled);
    localStorage.setItem("dice_sound_enabled", state.soundEnabled ? "1" : "0");
  });

  // Game Mode Selector
  elements.modeSelect.addEventListener("change", (e) => {
    state.targetWins = parseInt(e.target.value, 10);
    resetGame();
  });

  // Modal Play Again Button
  elements.modalPlayAgainBtn.addEventListener("click", () => {
    resetGame();
  });

  // Player 1 Rename
  const triggerRenameP1 = () => openRenameModal(1);
  elements.p1NameDisplay.addEventListener("click", triggerRenameP1);
  elements.editP1Btn.addEventListener("click", triggerRenameP1);

  // Player 2 Rename
  const triggerRenameP2 = () => openRenameModal(2);
  elements.p2NameDisplay.addEventListener("click", triggerRenameP2);
  elements.editP2Btn.addEventListener("click", triggerRenameP2);

  // Rename modal actions
  elements.renameCancelBtn.addEventListener("click", closeRenameModal);
  elements.renameSaveBtn.addEventListener("click", saveCustomName);
  elements.renameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveCustomName();
    if (e.key === "Escape") closeRenameModal();
  });

  // Close modals on clicking backdrop
  elements.championModal.addEventListener("click", (e) => {
    if (e.target === elements.championModal) elements.championModal.classList.add("hidden");
  });
  elements.renameModal.addEventListener("click", (e) => {
    if (e.target === elements.renameModal) closeRenameModal();
  });
}

function openRenameModal(playerNumber) {
  state.currentEditingPlayer = playerNumber;
  elements.renameInput.value = playerNumber === 1 ? state.p1Name : state.p2Name;
  elements.renameModal.classList.remove("hidden");
  setTimeout(() => elements.renameInput.focus(), 50);
}

function closeRenameModal() {
  elements.renameModal.classList.add("hidden");
}

function saveCustomName() {
  const newName = elements.renameInput.value.trim();
  if (newName) {
    if (state.currentEditingPlayer === 1) {
      state.p1Name = newName;
      elements.p1NameDisplay.textContent = newName;
      elements.p1ArenaName.textContent = newName;
      localStorage.setItem("dice_p1_name", newName);
    } else {
      state.p2Name = newName;
      elements.p2NameDisplay.textContent = newName;
      elements.p2ArenaName.textContent = newName;
      localStorage.setItem("dice_p2_name", newName);
    }
  }
  closeRenameModal();
}

function loadPersistedSettings() {
  const savedP1 = localStorage.getItem("dice_p1_name");
  const savedP2 = localStorage.getItem("dice_p2_name");
  const savedSound = localStorage.getItem("dice_sound_enabled");

  if (savedP1) {
    state.p1Name = savedP1;
    elements.p1NameDisplay.textContent = savedP1;
    elements.p1ArenaName.textContent = savedP1;
  }
  if (savedP2) {
    state.p2Name = savedP2;
    elements.p2NameDisplay.textContent = savedP2;
    elements.p2ArenaName.textContent = savedP2;
  }
  if (savedSound !== null) {
    state.soundEnabled = savedSound === "1";
    elements.soundOnIcon.classList.toggle("hidden", !state.soundEnabled);
    elements.soundOffIcon.classList.toggle("hidden", state.soundEnabled);
  }
}

// ==========================================
// 7. INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  loadPersistedSettings();
  setupEventListeners();
  confetti.init();
});
