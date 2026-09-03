import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function configureRenderer(canvas, alpha = true) {
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha,
    antialias: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  return renderer;
}

function initHeroScene() {
  const canvas = document.querySelector("#hero-marble-stage");
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const renderer = configureRenderer(canvas);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  scene.add(new THREE.HemisphereLight(0xfff4d5, 0x101b3d, 2.3));
  const key = new THREE.DirectionalLight(0xffffff, 3.2);
  key.position.set(-4, 5, 8);
  scene.add(key);

  const group = new THREE.Group();
  scene.add(group);
  const colours = [0x5bc0d0, 0xe2784f, 0xd9b65a, 0x9368d6, 0xf8efcf, 0x38a982, 0xe85870];
  const marbles = [];
  for (let i = 0; i < 12; i += 1) {
    const material = new THREE.MeshPhysicalMaterial({
      color: colours[i % colours.length],
      roughness: 0.2,
      metalness: 0.08,
      clearcoat: 0.8,
      clearcoatRoughness: 0.15,
    });
    const marble = new THREE.Mesh(new THREE.SphereGeometry(0.22 + (i % 3) * 0.025, 24, 16), material);
    const angle = (i / 12) * Math.PI * 2;
    marble.position.set(Math.cos(angle) * (2.1 + (i % 2) * 0.3), Math.sin(angle) * 1.35, 1.1 + (i % 3) * 0.14);
    marble.userData = { angle, radius: 2.1 + (i % 2) * 0.3, phase: i * 0.65 };
    group.add(marble);
    marbles.push(marble);
  }

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.35, 0.025, 8, 96),
    new THREE.MeshBasicMaterial({ color: 0xf4dca6, transparent: true, opacity: 0.45 }),
  );
  ring.rotation.x = Math.PI * 0.5;
  ring.position.z = 0.55;
  group.add(ring);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }

  resize();
  window.addEventListener("resize", resize, { passive: true });
  let frame = 0;
  function animate(time = 0) {
    frame = window.requestAnimationFrame(animate);
    const seconds = time * 0.001;
    group.rotation.z = Math.sin(seconds * 0.18) * 0.08;
    group.rotation.y = Math.sin(seconds * 0.22) * 0.12;
    marbles.forEach((marble) => {
      const data = marble.userData;
      marble.position.y += Math.sin(seconds * 1.2 + data.phase) * 0.0008;
      marble.rotation.x += 0.004;
      marble.rotation.y += 0.006;
    });
    renderer.render(scene, camera);
    if (reducedMotion) {
      window.cancelAnimationFrame(frame);
      renderer.render(scene, camera);
    }
  }
  animate();
}

function initMiniGame() {
  const root = document.querySelector("[data-mancalero-mini]");
  const canvas = document.querySelector("#mancalero-board");
  if (!(root instanceof HTMLElement) || !(canvas instanceof HTMLCanvasElement)) return;

  const renderer = configureRenderer(canvas, false);
  renderer.setClearColor(0x101d3b, 1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0, 15);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.HemisphereLight(0xfff7dd, 0x0e1832, 2.4));
  const key = new THREE.DirectionalLight(0xffffff, 3.8);
  key.position.set(-4, 5, 9);
  scene.add(key);

  const board = new THREE.Mesh(
    new THREE.BoxGeometry(13.4, 6.6, 0.42),
    new THREE.MeshStandardMaterial({ color: 0x273960, roughness: 0.72, metalness: 0.06 }),
  );
  board.position.z = -0.45;
  scene.add(board);
  const boardEdge = new THREE.Mesh(
    new THREE.BoxGeometry(13.55, 6.75, 0.12),
    new THREE.MeshBasicMaterial({ color: 0xe0b868, transparent: true, opacity: 0.72 }),
  );
  boardEdge.position.z = -0.69;
  scene.add(boardEdge);

  const playerPositions = Array.from({ length: 6 }, (_, i) => new THREE.Vector3(-4.65 + i * 1.86, -1.45, 0.05));
  const sproutPositions = Array.from({ length: 6 }, (_, i) => new THREE.Vector3(-4.65 + i * 1.86, 1.45, 0.05));
  const pitMeshes = [];
  const pitMaterials = {
    player: new THREE.MeshStandardMaterial({ color: 0x2fa7bb, roughness: 0.35, metalness: 0.12 }),
    sprout: new THREE.MeshStandardMaterial({ color: 0x65b98c, roughness: 0.35, metalness: 0.12 }),
  };
  const playerRing = new THREE.MeshBasicMaterial({ color: 0x7be1ec, transparent: true, opacity: 0.65 });
  const sproutRing = new THREE.MeshBasicMaterial({ color: 0xb4e6a4, transparent: true, opacity: 0.55 });

  function addPit(position, side, index) {
    const group = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.76, 0.76, 0.22, 32), pitMaterials[side]);
    body.rotation.x = Math.PI * 0.5;
    group.add(body);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.77, 0.035, 8, 32), side === "player" ? playerRing : sproutRing);
    ring.rotation.x = Math.PI * 0.5;
    ring.position.z = 0.13;
    group.add(ring);
    group.position.copy(position);
    group.userData = { side, index, body, ring };
    scene.add(group);
    pitMeshes.push(group);
  }
  playerPositions.forEach((position, index) => addPit(position, "player", index));
  sproutPositions.forEach((position, index) => addPit(position, "sprout", index));

  const marbleGroup = new THREE.Group();
  scene.add(marbleGroup);
  const marbleMaterials = {
    player: new THREE.MeshPhysicalMaterial({ color: 0x49c2e0, roughness: 0.18, metalness: 0.08, clearcoat: 0.8 }),
    sprout: new THREE.MeshPhysicalMaterial({ color: 0x78c98f, roughness: 0.2, metalness: 0.08, clearcoat: 0.8 }),
  };
  const offsets = [[-0.23, 0.18], [0.23, 0.18], [-0.23, -0.18], [0.23, -0.18], [0, 0.38], [0, -0.38], [-0.42, 0], [0.42, 0]];
  const pulseMeshes = [];
  const state = { player: [4, 4, 4, 4, 4, 4], sprout: [4, 4, 4, 4, 4, 4], score: 0, turn: 1, busy: false, ended: false };
  const path = [
    ...playerPositions.map((_, index) => ({ side: "player", index })),
    ...sproutPositions.map((_, index) => ({ side: "sprout", index: 5 - index })),
  ];

  const statusEl = root.querySelector("#mini-game-status");
  const scoreEl = root.querySelector("#mini-game-score");
  const turnEl = root.querySelector("#mini-game-turn");
  const controls = root.querySelector("#mini-game-controls");
  const restartButton = root.querySelector('[data-game-action="restart"]');
  if (!(statusEl instanceof HTMLElement) || !(scoreEl instanceof HTMLElement) || !(turnEl instanceof HTMLElement) || !(controls instanceof HTMLElement) || !(restartButton instanceof HTMLButtonElement)) return;

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function updateHud() {
    scoreEl.textContent = String(state.score);
    turnEl.textContent = String(Math.min(state.turn, 8));
    controls.querySelectorAll("button[data-pit]").forEach((button) => {
      const index = Number(button.dataset.pit);
      const available = !state.busy && !state.ended && state.player[index] > 0;
      button.disabled = !available;
      button.textContent = `Pit ${index + 1} · ${state.player[index]}`;
    });
  }

  function pulse(position) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 8), new THREE.MeshBasicMaterial({ color: 0xffe29a, transparent: true, opacity: 0.9 }));
    mesh.position.copy(position);
    mesh.position.z = 0.6;
    scene.add(mesh);
    pulseMeshes.push({ mesh, age: 0 });
  }

  function renderBoard() {
    while (marbleGroup.children.length) marbleGroup.remove(marbleGroup.children[0]);
    const renderSide = (values, positions, side) => values.forEach((count, pitIndex) => {
      const position = positions[pitIndex];
      for (let i = 0; i < count; i += 1) {
        const offset = offsets[i % offsets.length];
        const marble = new THREE.Mesh(new THREE.SphereGeometry(0.16, 18, 12), marbleMaterials[side]);
        marble.position.set(position.x + offset[0], position.y + offset[1], 0.36 + (i % 2) * 0.02);
        marbleGroup.add(marble);
      }
    });
    renderSide(state.player, playerPositions, "player");
    renderSide(state.sprout, sproutPositions, "sprout");
    updateHud();
  }

  function addPitButtons() {
    controls.querySelectorAll("button[data-pit]").forEach((button) => button.remove());
    const anchor = restartButton;
    for (let i = 0; i < 6; i += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.pit = String(i);
      button.addEventListener("click", () => playerMove(i));
      controls.insertBefore(button, anchor);
    }
  }

  function finishRound() {
    state.ended = true;
    state.busy = false;
    setStatus("Round complete — restart when you want another line.");
    updateHud();
  }

  const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, reducedMotion ? 0 : ms));

  async function distribute(side, index) {
    const values = state[side];
    const start = side === "player" ? index : 11 - index;
    const count = values[index];
    values[index] = 0;
    renderBoard();
    for (let step = 0; step < count; step += 1) {
      const target = path[(start + step) % path.length];
      state[target.side][target.index] += 1;
      if (side === "player") state.score += target.side === "player" ? 4 : 2;
      pulse(target.side === "player" ? playerPositions[target.index] : sproutPositions[target.index]);
      renderBoard();
      await wait(95);
    }
  }

  async function playerMove(index) {
    if (state.busy || state.ended || state.player[index] < 1) return;
    state.busy = true;
    setStatus(`You sowed Pit ${index + 1}. Watch the line.`);
    updateHud();
    await distribute("player", index);
    if (state.turn >= 8 || state.player.every((value) => value === 0) || state.sprout.every((value) => value === 0)) {
      finishRound();
      return;
    }
    await wait(360);
    const sproutIndex = state.sprout.reduce((best, value, candidate) => value > state.sprout[best] ? candidate : best, 0);
    setStatus("Sprout is sowing.");
    await distribute("sprout", sproutIndex);
    state.turn += 1;
    state.busy = false;
    if (state.turn > 8 || state.player.every((value) => value === 0) || state.sprout.every((value) => value === 0)) finishRound();
    else setStatus("Choose another blue pit to sow.");
    updateHud();
  }

  function restart() {
    state.player = [4, 4, 4, 4, 4, 4];
    state.sprout = [4, 4, 4, 4, 4, 4];
    state.score = 0;
    state.turn = 1;
    state.busy = false;
    state.ended = false;
    setStatus("Choose a blue pit to sow.");
    renderBoard();
  }

  restartButton.addEventListener("click", restart);
  canvas.addEventListener("pointerdown", (event) => {
    if (state.busy || state.ended) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 13.2;
    const y = (0.5 - (event.clientY - rect.top) / rect.height) * 6.5;
    const index = playerPositions.reduce((best, position, candidate) => Math.abs(position.x - x) < Math.abs(playerPositions[best].x - x) ? candidate : best, 0);
    if (Math.abs(playerPositions[index].x - x) < 0.9 && Math.abs(playerPositions[index].y - y) < 1.1) playerMove(index);
  });

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const width = Math.max(1, rect.width);
    const height = Math.max(1, rect.height);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener("resize", resize, { passive: true });
  addPitButtons();
  restart();

  let last = performance.now();
  function animate(now) {
    window.requestAnimationFrame(animate);
    const delta = Math.min(0.05, (now - last) / 1000);
    last = now;
    pulseMeshes.splice(0).forEach(({ mesh, age }) => {
      const nextAge = age + delta;
      mesh.scale.setScalar(1 + nextAge * 3);
      mesh.material.opacity = Math.max(0, 0.9 - nextAge * 2.4);
      if (nextAge < 0.55) pulseMeshes.push({ mesh, age: nextAge });
      else {
        scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
      }
    });
    if (!reducedMotion) marbleGroup.rotation.z = Math.sin(now * 0.0004) * 0.003;
    renderer.render(scene, camera);
  }
  animate(performance.now());
}

initHeroScene();
initMiniGame();
