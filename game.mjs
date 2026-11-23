export const WIDTH = 720;
export const HEIGHT = 480;
export const TARGET = 8;
export const ROUND_SECONDS = 45;

const fireflySeeds = [
  [94, 92], [621, 104], [355, 67], [148, 350],
  [565, 363], [352, 407], [245, 187], [481, 260],
];

export function createGame() {
  return {
    phase: 'ready', time: ROUND_SECONDS, caught: 0, lives: 3,
    player: { x: WIDTH / 2, y: HEIGHT / 2, vx: 0, vy: 0, faceX: 1, faceY: 0 },
    fireflies: fireflySeeds.map(([x, y], i) => ({ x, y, phase: i * 1.7, caught: false })),
    owl: { x: 86, y: 240, vx: 1.55, stun: 0 },
    invulnerable: 0, dashCooldown: 0, dashTime: 0,
  };
}

export function startGame(state) {
  if (state.phase === 'ready') state.phase = 'playing';
}

export function step(state, input, dt = 1 / 60) {
  if (state.phase !== 'playing') return;
  const p = state.player;
  const ax = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  const ay = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  const magnitude = Math.hypot(ax, ay) || 1;
  if (ax || ay) { p.faceX = ax / magnitude; p.faceY = ay / magnitude; }
  state.dashCooldown = Math.max(0, state.dashCooldown - dt);
  state.dashTime = Math.max(0, state.dashTime - dt);
  if (input.dash && state.dashCooldown === 0) {
    const direction = ax || ay ? magnitude : Math.hypot(p.vx, p.vy) || 1;
    const dx = ax || (p.vx ? p.vx / direction : p.faceX);
    const dy = ay || (p.vy ? p.vy / direction : p.faceY);
    const length = Math.hypot(dx, dy) || 1;
    p.vx = dx / length * 390;
    p.vy = dy / length * 390;
    state.dashTime = 0.22;
    state.dashCooldown = 4;
    if (Math.hypot(p.x - state.owl.x, p.y - state.owl.y) < 115) state.owl.stun = 1.1;
  }
  p.vx = (p.vx + ax / magnitude * 720 * dt) * Math.pow(0.91, dt * 60);
  p.vy = (p.vy + ay / magnitude * 720 * dt) * Math.pow(0.91, dt * 60);
  const speed = Math.hypot(p.vx, p.vy);
  const maxSpeed = state.dashTime > 0 ? 390 : 240;
  if (speed > maxSpeed) { p.vx *= maxSpeed / speed; p.vy *= maxSpeed / speed; }
  p.x = Math.max(22, Math.min(WIDTH - 22, p.x + p.vx * dt));
  p.y = Math.max(22, Math.min(HEIGHT - 22, p.y + p.vy * dt));

  for (const f of state.fireflies) {
    if (!f.caught && Math.hypot(p.x - f.x, p.y - f.y) < 26) {
      f.caught = true;
      state.caught++;
      if (state.caught >= TARGET) { state.phase = 'won'; return; }
    }
  }

  if (state.owl.stun > 0) state.owl.stun -= dt;
  else {
    state.owl.x += state.owl.vx * 60 * dt;
    if (state.owl.x < 54 || state.owl.x > WIDTH - 54) state.owl.vx *= -1;
    if (state.invulnerable > 0) state.invulnerable -= dt;
    else if (Math.hypot(p.x - state.owl.x, p.y - state.owl.y) < 35) {
      state.lives--;
      state.invulnerable = 1.1;
      state.owl.stun = 0.75;
      p.vx = state.owl.x < p.x ? 180 : -180;
      p.vy = state.owl.y < p.y ? 180 : -180;
      if (!state.lives) { state.phase = 'lost'; return; }
    }
  }
  state.time = Math.max(0, state.time - dt);
  if (state.time === 0) state.phase = 'lost';
}
