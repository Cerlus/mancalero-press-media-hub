const root = document.querySelector("[data-mancalero-mini]");

if (root instanceof HTMLElement) {
  const STARTING_PITS = [4, 4, 4, 4, 4, 4];
  const TARGET_SCORE = 120;
  const TURN_LIMIT = 8;
  const NOTE_FREQUENCIES = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5, 1174.66, 1318.51, 1396.91, 1567.98];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const playerPitsElement = root.querySelector("#player-pits");
  const sproutPitsElement = root.querySelector("#sprout-pits");
  const statusElement = root.querySelector("#mini-game-status");
  const pointsElement = root.querySelector("#mini-points");
  const scoreElement = root.querySelector("#mini-game-score");
  const progressElement = root.querySelector("#mini-score-progress");
  const turnElement = root.querySelector("#mini-game-turn");
  const turnStateElement = root.querySelector("#mini-turn-state");
  const playerStoreElement = root.querySelector("#mini-player-store");
  const sproutStoreElement = root.querySelector("#mini-sprout-store");
  const restartButton = root.querySelector('[data-game-action="restart"]');
  const soundButton = root.querySelector('[data-game-action="sound"]');

  const ready = [playerPitsElement, sproutPitsElement, statusElement, pointsElement, scoreElement, progressElement, turnElement, turnStateElement, playerStoreElement, sproutStoreElement, restartButton, soundButton].every(Boolean);

  if (ready) {
    let state = createState();
    let soundOn = true;
    let audioContext = null;

    function createState() {
      return {
        player: [...STARTING_PITS],
        sprout: [...STARTING_PITS],
        playerStore: 0,
        sproutStore: 0,
        score: 0,
        turn: 1,
        busy: false,
        ended: false,
      };
    }

    function ensureAudio() {
      if (!soundOn) return null;
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      if (!audioContext) audioContext = new AudioContextClass();
      if (audioContext.state === "suspended") audioContext.resume();
      return audioContext;
    }

    function playTone(frequency, duration = 0.07, volume = 0.055, type = "square") {
      const audio = ensureAudio();
      if (!audio) return;
      const now = audio.currentTime;
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(volume, now + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      oscillator.connect(gain).connect(audio.destination);
      oscillator.start(now);
      oscillator.stop(now + duration + 0.015);
    }

    function playCapture() {
      [659.25, 783.99, 1046.5].forEach((frequency, index) => {
        window.setTimeout(() => playTone(frequency, 0.14, 0.05, "triangle"), index * 55);
      });
    }

    const wait = (milliseconds) => new Promise((resolve) => window.setTimeout(resolve, reducedMotion ? 0 : milliseconds));

    function fillMarbles(container, count, cool = false) {
      container.textContent = "";
      container.classList.toggle("cool-pile", cool);
      const shown = Math.min(count, 8);
      for (let index = 0; index < shown; index += 1) container.append(document.createElement("i"));
      if (count > shown) {
        const remainder = document.createElement("b");
        remainder.textContent = `+${count - shown}`;
        container.append(remainder);
      }
    }

    function buildPit(side, index, count, interactive) {
      const pit = document.createElement(interactive ? "button" : "div");
      pit.className = `mini-pit ${side === "player" ? "player-pit" : "opponent-pit"}`;
      if (pit instanceof HTMLButtonElement) {
        pit.type = "button";
        pit.disabled = state.busy || state.ended || count === 0;
        pit.setAttribute("aria-label", `Sow your pit ${index + 1}, containing ${count} marbles`);
        pit.addEventListener("click", () => playerMove(index));
      }
      const pile = document.createElement("span");
      pile.className = "marble-pile";
      fillMarbles(pile, count, side === "player");
      const amount = document.createElement("strong");
      amount.textContent = String(count);
      pit.append(pile, amount);
      if (interactive) {
        const label = document.createElement("small");
        label.textContent = `PIT ${index + 1}`;
        pit.append(label);
      }
      return pit;
    }

    function render() {
      playerPitsElement.textContent = "";
      state.player.forEach((count, index) => playerPitsElement.append(buildPit("player", index, count, true)));
      sproutPitsElement.textContent = "";
      [5, 4, 3, 2, 1, 0].forEach((index) => sproutPitsElement.append(buildPit("sprout", index, state.sprout[index], false)));
      pointsElement.textContent = String(state.score);
      scoreElement.textContent = String(state.score);
      progressElement.style.width = `${Math.min(100, Math.round((state.score / TARGET_SCORE) * 100))}%`;
      turnElement.textContent = String(Math.min(state.turn, TURN_LIMIT));
      turnStateElement.textContent = state.busy ? "IN MOTION" : state.ended ? "TABLE END" : "YOUR TURN";
      playerStoreElement.textContent = String(state.playerStore);
      sproutStoreElement.textContent = String(state.sproutStore);
      root.querySelectorAll('[data-store-count="player"]').forEach((element) => { element.textContent = String(state.playerStore); });
      root.querySelectorAll('[data-store-count="sprout"]').forEach((element) => { element.textContent = String(state.sproutStore); });
      root.querySelectorAll('[data-store-marbles="player"]').forEach((element) => fillMarbles(element, state.playerStore, true));
      root.querySelectorAll('[data-store-marbles="sprout"]').forEach((element) => fillMarbles(element, state.sproutStore, false));
    }

    function setStatus(message) {
      statusElement.textContent = message;
      render();
    }

    function playerRing() {
      return [
        ...Array.from({ length: 6 }, (_, index) => ({ side: "player", index })),
        { side: "player", store: true },
        ...Array.from({ length: 6 }, (_, index) => ({ side: "sprout", index })),
      ];
    }

    function sproutRing() {
      return [
        ...Array.from({ length: 6 }, (_, index) => ({ side: "sprout", index })),
        { side: "sprout", store: true },
        ...Array.from({ length: 6 }, (_, index) => ({ side: "player", index })),
      ];
    }

    async function sow(side, pitIndex) {
      const ring = side === "player" ? playerRing() : sproutRing();
      const values = state[side];
      const marbleCount = values[pitIndex];
      const start = ring.findIndex((slot) => slot.side === side && slot.index === pitIndex && !slot.store);
      values[pitIndex] = 0;
      render();
      let lastSlot = ring[start];

      for (let step = 0; step < marbleCount; step += 1) {
        const slot = ring[(start + step + 1) % ring.length];
        lastSlot = slot;
        if (slot.store) {
          if (slot.side === "player") state.playerStore += 1;
          else state.sproutStore += 1;
        } else {
          state[slot.side][slot.index] += 1;
        }
        if (side === "player") state.score += slot.side === "player" ? 4 : 2;
        playTone(NOTE_FREQUENCIES[step % NOTE_FREQUENCIES.length]);
        render();
        await wait(105);
      }

      if (!lastSlot.store && lastSlot.side === side) {
        const ownPit = state[side][lastSlot.index];
        const oppositeIndex = 5 - lastSlot.index;
        const oppositeSide = side === "player" ? "sprout" : "player";
        const captured = state[oppositeSide][oppositeIndex];
        if (ownPit === 1 && captured > 0) {
          state[side][lastSlot.index] = 0;
          state[oppositeSide][oppositeIndex] = 0;
          if (side === "player") {
            state.playerStore += captured + 1;
            state.score += (captured + 1) * 10;
          } else {
            state.sproutStore += captured + 1;
          }
          playCapture();
          setStatus(side === "player" ? `Captured ${captured + 1} marbles — score engine online.` : `Sprout captured ${captured + 1} marbles.`);
          await wait(380);
        }
      }
      return Boolean(lastSlot.store && lastSlot.side === side);
    }

    function collectRemaining() {
      const playerLeft = state.player.reduce((sum, value) => sum + value, 0);
      const sproutLeft = state.sprout.reduce((sum, value) => sum + value, 0);
      state.playerStore += playerLeft;
      state.sproutStore += sproutLeft;
      state.score += playerLeft * 6;
      state.player.fill(0);
      state.sprout.fill(0);
    }

    function finishRound(message = "Table complete — restart whenever you want another line.") {
      state.ended = true;
      state.busy = false;
      playTone(1046.5, 0.22, 0.065, "triangle");
      setStatus(message);
    }

    async function playerMove(index) {
      if (state.busy || state.ended || state.player[index] < 1) return;
      ensureAudio();
      state.busy = true;
      setStatus(`Sowing Pit ${index + 1}…`);
      const extraTurn = await sow("player", index);
      if (state.player.every((value) => value === 0) || state.sprout.every((value) => value === 0)) {
        collectRemaining();
        finishRound();
        return;
      }
      if (extraTurn) {
        state.busy = false;
        setStatus("Extra turn — choose another blue pit.");
        return;
      }
      await wait(420);
      const sproutIndex = state.sprout.reduce((best, value, candidate) => value > state.sprout[best] ? candidate : best, 0);
      setStatus(`Sprout is sowing Pit ${sproutIndex + 1}…`);
      await sow("sprout", sproutIndex);
      state.turn += 1;
      if (state.turn > TURN_LIMIT || state.player.every((value) => value === 0) || state.sprout.every((value) => value === 0)) {
        if (state.player.every((value) => value === 0) || state.sprout.every((value) => value === 0)) collectRemaining();
        finishRound();
        return;
      }
      state.busy = false;
      setStatus("Your turn — choose another blue pit.");
    }

    function restart() {
      state = createState();
      setStatus("Choose one of your blue pits to sow.");
    }

    restartButton.addEventListener("click", restart);
    soundButton.addEventListener("click", () => {
      soundOn = !soundOn;
      soundButton.textContent = soundOn ? "SFX ON" : "SFX OFF";
      soundButton.setAttribute("aria-pressed", String(soundOn));
      if (soundOn) playTone(783.99, 0.09, 0.045, "triangle");
    });
    render();
  }
}
