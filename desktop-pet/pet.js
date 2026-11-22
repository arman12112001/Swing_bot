'use strict';
/* =============================================================================
   LOVE BEAR - everything you may want to change is in this first block.
   ============================================================================= */
const HER_NAME = 'Chan';
const MESSAGE_MINUTES = [20, 35];   // a sweet message every 20-35 minutes
const NAP_AFTER_SECONDS = 120;      // she hasn't touched the laptop for this long -> he takes a nap
const BEAR_SCALE = 1.75;            // size of the bear (1.75 is about 130 pixels tall)
const WALK_SPEED = 42;              // pixels per second

const MESSAGES = [
  `I love you, ${HER_NAME} ❤️`,
  'Drink some water 💧',
  'Time for a little stretch? 🙆‍♀️',
  "You're doing amazing ✨",
  'So proud of you, always 🥰',
  "Don't forget to smile 😊",
  "Break time? I'll wait for you ☕",
  'Sending you a big bear hug 🤗',
  "You're the cutest 🐻",
  'Have you eaten something? 🍕',
  "You've got this! 💪",
  'Thinking about you 💭❤️',
  'Rest your eyes for a minute 👀',
  "I'm right here with you ❤️",
  'Miss you already 💕',
];
const LATE_NIGHT = ["It's really late, my love. Sleep soon? 😴", 'Bed time, cutie! 🌙'];
const LUNCH = ['Lunch time! Eat something yummy 🍝'];
const PAT_REPLIES = ['Hehe ❤️', 'That tickles! 😆', 'Again! 🥰', 'Love you! 💕', 'Mwah 😘', '😊', 'Hehe, hi! 👋'];
const MANY_PATS = `I love you sooo much, ${HER_NAME}! ❤️❤️❤️`;
const DROP_REPLIES = ['Wheee! 😆', 'Oof! Hehe', 'Again? 🙈', 'I can fly! 🐻✨'];
const WELCOME_BACK = [`Welcome back, ${HER_NAME}! ❤️`, "Yay, you're back! 🥰", 'Missed you! 💕'];
function greeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return `Good morning, ${HER_NAME}! ☀️`;
  if (h >= 12 && h < 17) return `Hi ${HER_NAME}! I'm here with you ❤️`;
  if (h >= 17 && h < 23) return `Good evening, ${HER_NAME} 🌙`;
  return `It's late, ${HER_NAME}... don't stay up too long 😴`;
}
function randomMessage() {
  const h = new Date().getHours();
  if ((h >= 23 || h < 5) && Math.random() < 0.5) return pick(LATE_NIGHT);
  if (h >= 12 && h < 14 && Math.random() < 0.3) return pick(LUNCH);
  return pick(MESSAGES);
}

/* ============================================================================= */
const TAU = Math.PI * 2;
const FONT = '"Segoe UI", "Segoe UI Emoji", system-ui, -apple-system, Roboto, Arial, sans-serif';
const OUTFIT = { fur: '#d8a383', leg: '#d8a383', ear: '#d8a383', earInner: '#7a4f3e', line: '#4a2e26', pad: '#7a4f3e' };
const FOOT_PAD = 8;                 // the window reaches this far below his feet (for his shadow)
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const now = () => performance.now() / 1000;

// In the app, window.bear comes from preload.js. Opened in a normal browser (for testing) it does nothing.
const api = window.bear || {
  getScreen: async () => ({ workArea: { x: 0, y: 0, width: 1280, height: 680 }, winW: innerWidth, winH: innerHeight, scaleFactor: 1 }),
  getSettings: async () => ({ sound: false }),
  move() {}, setClickThrough() {}, ready() {}, on() {},
};

const canvas = document.getElementById('c');
const g = canvas.getContext('2d');
let W = 300, H = 330, dpr = 1, scr = null, settings = { sound: false };
let face = null;

const B = {                         // the bear, in screen coordinates (x = middle, y = his feet)
  x: 0, y: 0, vx: 0, vy: 0, dir: 1, state: 'idle', until: 0, phase: 0, t: 0, onFloor: true,
  dragging: false, sleeping: false, target: null,
};
let bubble = null, particles = [], hover = false, clickThrough = true;
let nextMessageAt = 0, pats = [], lastWinX = null, lastWinY = null, idleSec = 0;

/* ---------- screen ---------- */
function floorY() { return scr.workArea.y + scr.workArea.height; }
function minX() { return scr.workArea.x + 32; }
function maxX() { return scr.workArea.x + scr.workArea.width - 32; }
// The window stays fully on the screen; near an edge the bear is simply drawn off-centre inside it.
function winPos() {
  const wa = scr.workArea;
  return { x: Math.round(clamp(B.x - W / 2, wa.x, wa.x + wa.width - W)), y: Math.round(B.y - (H - FOOT_PAD)) };
}
function bearX() { return B.x - winPos().x; }   // where the bear is inside the window
function syncWindow() {
  const p = winPos();
  if (p.x !== lastWinX || p.y !== lastWinY) { lastWinX = p.x; lastWinY = p.y; api.move(p.x, p.y); }
}
function applyScreen(s) {
  scr = s; W = s.winW || W; H = s.winH || H;
  B.x = clamp(B.x || (s.workArea.x + s.workArea.width / 2), minX(), maxX());
  if (B.onFloor || B.y > floorY() || !B.y) { B.y = floorY(); B.onFloor = true; }
  resize();
}
function resize() {
  dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
}

/* ---------- his face (a cut-out picture with a thin dark outline, like in the game) ---------- */
function makeCanvas(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
function buildCutout(im) {
  const iw = im.naturalWidth, ih = im.naturalHeight, srcH = Math.min(ih, iw * 1.7);
  const W0 = 220, H0 = Math.round(W0 * srcH / iw), P = 7;
  const c = makeCanvas(W0 + P * 2, H0 + P * 2), cg = c.getContext('2d');
  const sil = makeCanvas(c.width, c.height), sg = sil.getContext('2d');
  sg.drawImage(im, 0, 0, iw, srcH, P, P, W0, H0);
  sg.globalCompositeOperation = 'source-in';
  sg.fillStyle = 'rgba(28,12,44,0.85)'; sg.fillRect(0, 0, sil.width, sil.height);
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; cg.drawImage(sil, Math.cos(a) * 4, Math.sin(a) * 4); }
  cg.imageSmoothingQuality = 'high';
  cg.drawImage(im, 0, 0, iw, srcH, P, P, W0, H0);
  return { canvas: c, aspect: c.height / c.width, sized: new Map() };
}
function faceAt(f, pxW) {
  pxW = clamp(Math.round(pxW), 8, 400);
  let c = f.sized.get(pxW);
  if (c) return c;
  c = makeCanvas(pxW, pxW * f.aspect);
  const cg = c.getContext('2d'); cg.imageSmoothingQuality = 'high';
  cg.drawImage(f.canvas, 0, 0, c.width, c.height);
  if (f.sized.size > 12) f.sized.clear();
  f.sized.set(pxW, c);
  return c;
}
function loadFace() {
  return new Promise((resolve) => {
    const im = new Image();
    im.onload = () => { try { face = buildCutout(im); } catch (e) { face = null; } resolve(); };
    im.onerror = () => resolve();
    im.src = 'assets/me.png';
  });
}

/* ---------- drawing helpers ---------- */
function rr(x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  g.beginPath(); g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
function heartPath(x, y, s) {
  g.beginPath(); g.moveTo(x, y + s * 0.9);
  g.bezierCurveTo(x - s * 1.25, y + s * 0.05, x - s * 0.95, y - s * 0.95, x, y - s * 0.35);
  g.bezierCurveTo(x + s * 0.95, y - s * 0.95, x + s * 1.25, y + s * 0.05, x, y + s * 0.9);
  g.closePath();
}
function limb(x, y, len, ang, w) {
  g.save(); g.translate(x, y); g.rotate(ang);
  rr(-w / 2, -w / 2, w, len + w / 2, w / 2);
  g.fillStyle = OUTFIT.fur; g.fill(); g.lineWidth = 1.4; g.strokeStyle = OUTFIT.line; g.stroke();
  g.restore();
}
function head(cx, bottom, Wd, tilt) {
  const Hd = Wd * (face ? face.aspect : 1);
  g.save(); g.translate(cx, bottom - Hd / 2); if (tilt) g.rotate(tilt);
  for (const side of [-1, 1]) {                        // bear ears behind the head
    const ex = side * Wd * 0.34, ey = -Hd / 2 + Hd * 0.12, r = Wd * 0.19;
    g.beginPath(); g.arc(ex, ey, r, 0, TAU); g.fillStyle = OUTFIT.ear; g.fill(); g.lineWidth = 1.4; g.strokeStyle = OUTFIT.line; g.stroke();
    g.beginPath(); g.arc(ex, ey + r * 0.1, r * 0.5, 0, TAU); g.fillStyle = OUTFIT.earInner; g.fill();
  }
  if (face) g.drawImage(faceAt(face, Wd * BEAR_SCALE * dpr), -Wd / 2, -Hd / 2, Wd, Hd);
  else { g.fillStyle = '#d8a383'; g.beginPath(); g.arc(0, 0, Wd / 2, 0, TAU); g.fill(); g.lineWidth = 1.5; g.strokeStyle = OUTFIT.line; g.stroke(); }
  g.restore();
}
// The brown bear from the game (same body), with a few extra poses: sit, sleep, dangle, fall.
function drawBear(x, y, pose, dir, t, phase) {
  const d = dir >= 0 ? 1 : -1;
  let bob = 0, af = 0.25, ab = -0.25, tilt = 0, stepF = 0, stepB = 0, tuck = 0, sit = false, headTilt = 0, sway = 0;
  switch (pose) {
    case 'walk': { const s = Math.sin(phase); stepF = s; stepB = -s; af = -s * 0.9; ab = s * 0.9; bob = -Math.abs(s) * 1.4; tilt = d * 0.05; break; }
    case 'jump': tuck = 1; af = 2.6; ab = -0.5; tilt = -d * 0.08; break;
    case 'fall': tuck = 0.4; af = 1.95; ab = -1.95; break;
    case 'dangle': af = 1.8 + Math.sin(t * 7) * 0.25; ab = -1.8 - Math.sin(t * 7) * 0.25; sway = Math.sin(t * 4) * 0.08; break;
    case 'wave': af = 2.5 + Math.sin(t * 9) * 0.45; ab = 0.3; bob = Math.sin(t * 3) * 0.4; break;
    case 'sit': sit = true; af = 0.45; ab = -0.45; bob = Math.sin(t * 2) * 0.35; break;
    case 'sleep': sit = true; af = 0.3; ab = -0.3; bob = Math.sin(t * 1.5) * 0.6; headTilt = d * 0.3; break;
    default: bob = Math.sin(t * 2.6) * 0.5;
  }
  g.save(); g.translate(x, y); g.scale(BEAR_SCALE, BEAR_SCALE);
  if (sway) { g.translate(0, -40); g.rotate(sway); g.translate(0, 40); }
  const legH = 11.5, legW = 8, legTop = -legH, legX = 5, bw = 22;
  const lower = sit ? 9 : 0;
  const top = -31 + bob + lower, bot = sit ? 0 : legTop + 4.5 + bob * 0.4;
  const leg = (lx, step) => {
    const lift = Math.max(0, step) * 3 + tuck * 3, x0 = lx + step * 2.2 * d - legW / 2, y0 = legTop - lift;
    rr(x0, y0, legW, legH, legW / 2); g.fillStyle = OUTFIT.fur; g.fill(); g.lineWidth = 1.5; g.strokeStyle = OUTFIT.line; g.stroke();
  };
  if (!sit) leg(-d * legX, stepB);
  limb(-d * (bw / 2 - 2), top + 8, 7, -d * ab, 6.5);
  if (!sit) leg(d * legX, stepF);
  rr(-bw / 2, top, bw, bot - top, Math.min(13, bw / 2, (bot - top) / 2)); g.fillStyle = OUTFIT.fur; g.fill(); g.lineWidth = 1.7; g.strokeStyle = OUTFIT.line; g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.22)'; g.beginPath(); g.ellipse(0, (top + bot) / 2 + 2, bw * 0.3, (bot - top) * 0.28, 0, 0, TAU); g.fill();   // tummy
  if (sit) for (const side of [-1, 1]) {               // sitting: two round feet in front, paw pads showing
    const fx = side * (legX + 2.5), fy = -3.2;
    g.beginPath(); g.ellipse(fx, fy, 5.6, 4.6, 0, 0, TAU); g.fillStyle = OUTFIT.fur; g.fill(); g.lineWidth = 1.5; g.strokeStyle = OUTFIT.line; g.stroke();
    g.fillStyle = OUTFIT.pad; g.beginPath(); g.ellipse(fx, fy + 0.8, 2.6, 2.1, 0, 0, TAU); g.fill();
    for (const tx of [-2.6, 0, 2.6]) { g.beginPath(); g.arc(fx + tx, fy - 2.6, 0.95, 0, TAU); g.fill(); }
  }
  limb(d * (bw / 2 - 2), top + 8, 7, -d * af, 6.5);
  head(0, top + 6 + (pose === 'sleep' ? 2 : 0), 34, tilt + headTilt);
  g.restore();
}

/* ---------- speech bubble ---------- */
function wrap(text, maxW) {
  const words = text.split(' '), lines = []; let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (g.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}
function say(text, seconds) {
  bubble = { text, t: 0, dur: seconds || clamp(4 + text.length * 0.09, 4.5, 9) };
}
function drawBubble(cx, headTop) {
  if (!bubble) return;
  const fs = 15;
  g.font = `600 ${fs}px ${FONT}`;
  const lines = wrap(bubble.text, 210);
  const tw = Math.max(...lines.map((l) => g.measureText(l).width));
  const bw = tw + 26, bh = lines.length * (fs + 5) + 16;
  const bx = clamp(cx, bw / 2 + 3, W - bw / 2 - 3);          // the window is always on screen, so this keeps the bubble visible
  const by = Math.max(4, headTop - bh - 14);
  const a = clamp(Math.min(bubble.t / 0.2, (bubble.dur - bubble.t) / 0.4), 0, 1);
  const pop = 0.85 + 0.15 * clamp(bubble.t / 0.18, 0, 1);
  g.save(); g.globalAlpha = a;
  g.translate(bx, by + bh); g.scale(pop, pop); g.translate(-bx, -(by + bh));
  g.shadowColor = 'rgba(60,20,50,0.25)'; g.shadowBlur = 8; g.shadowOffsetY = 2;
  rr(bx - bw / 2, by, bw, bh, 14); g.fillStyle = '#ffffff'; g.fill();
  g.shadowColor = 'transparent';
  const tailX = clamp(cx, bx - bw / 2 + 16, bx + bw / 2 - 16);
  g.beginPath(); g.moveTo(tailX - 8, by + bh - 1); g.lineTo(tailX, by + bh + 10); g.lineTo(tailX + 8, by + bh - 1); g.closePath(); g.fill();
  g.lineWidth = 2; g.strokeStyle = '#ff8fb0'; rr(bx - bw / 2, by, bw, bh, 14); g.stroke();
  g.fillStyle = '#ffffff'; g.fillRect(tailX - 7, by + bh - 2, 14, 3);
  g.strokeStyle = '#ff8fb0'; g.beginPath(); g.moveTo(tailX - 8, by + bh); g.lineTo(tailX, by + bh + 10); g.lineTo(tailX + 8, by + bh); g.stroke();
  g.fillStyle = '#5a1d3a'; g.textAlign = 'center'; g.textBaseline = 'top';
  lines.forEach((l, i) => g.fillText(l, bx, by + 9 + i * (fs + 5)));
  g.restore();
}

/* ---------- little effects ---------- */
function hearts(n, spread) {
  for (let i = 0; i < n; i++) particles.push({ kind: 'heart', x: rand(-spread, spread), y: rand(-110, -70), vx: rand(-25, 25), vy: rand(-90, -45), life: rand(1.2, 1.9), age: 0, s: rand(5, 9), c: pick(['#ff4d79', '#ff8fb0', '#ff2d55', '#ffb3c7']) });
}
function zzz() { particles.push({ kind: 'z', x: 16 * B.dir, y: -112, vx: rand(9, 15) * (B.dir || 1), vy: -24, life: 2.8, age: 0, s: 1 }); }
function drawParticles(cx, feetY) {
  for (const q of particles) {
    const a = clamp(1 - q.age / q.life, 0, 1);
    g.globalAlpha = a;
    if (q.kind === 'heart') { g.fillStyle = q.c; heartPath(cx + q.x, feetY + q.y, q.s); g.fill(); }
    else { g.fillStyle = '#5b6cff'; g.font = `800 ${Math.round(13 + q.age * 6)}px ${FONT}`; g.textAlign = 'center'; g.fillText('z', cx + q.x, feetY + q.y); }
  }
  g.globalAlpha = 1;
}

/* ---------- sounds (off unless she turns them on in the tray menu) ---------- */
const sounds = {};
function play(name) {
  if (!settings.sound) return;
  try { const a = sounds[name] || (sounds[name] = new Audio('assets/' + name + '.mp3')); a.volume = 0.6; a.currentTime = 0; a.play().catch(() => {}); } catch (e) { /* ignore */ }
}

/* ---------- what he does ---------- */
function setState(state, seconds) {
  B.state = state; B.t = 0; B.until = seconds || 0;
  if (state === 'walk' && !B.target) B.dir = B.x < minX() + 80 ? 1 : B.x > maxX() - 80 ? -1 : (Math.random() < 0.5 ? -1 : 1);
}
function nextState() {
  const h = new Date().getHours(), night = h >= 23 || h < 6;
  const r = Math.random();
  if (r < (night ? 0.25 : 0.45)) setState('walk', rand(4, 10));
  else if (r < (night ? 0.45 : 0.7)) setState('idle', rand(2, 5));
  else if (r < 0.93) setState('sit', rand(8, 20));
  else setState('wave', 2.2);
}
function wakeUp() {
  B.sleeping = false; particles = particles.filter((q) => q.kind !== 'z');
  setState('wave', 2.6); say(pick(WELCOME_BACK)); hearts(5, 20); play('laugh');
}
function goToSleep() {
  if (B.dragging || !B.onFloor) return;
  B.sleeping = true; B.target = null; setState('sleep', 0); bubble = null;
}
function pat() {
  if (B.sleeping) { wakeUp(); return; }
  const t = now(); pats = pats.filter((p) => t - p < 4); pats.push(t);
  hearts(pats.length >= 5 ? 14 : 6, 24);
  if (pats.length >= 5) { say(MANY_PATS); pats = []; } else say(pick(PAT_REPLIES), 2.6);
  play('giggle');
  if (B.onFloor) { B.vy = -260; B.onFloor = false; setState('hop', 0); }
}
function comeHere() {
  if (B.sleeping) wakeUp();
  B.target = scr.workArea.x + scr.workArea.width / 2; setState('walk', 30);
}

function update(dt) {
  B.t += dt;
  if (bubble) { bubble.t += dt; if (bubble.t > bubble.dur) bubble = null; }
  for (const q of particles) { q.age += dt; q.x += q.vx * dt; q.y += q.vy * dt; if (q.kind === 'heart') q.vy += 10 * dt; }
  particles = particles.filter((q) => q.age < q.life);

  if (B.dragging) { syncWindow(); return; }
  if (!B.onFloor) {                                    // falling (after being dropped, or a little hop)
    B.vy = Math.min(B.vy + 1500 * dt, 1400); B.y += B.vy * dt;
    if (B.y >= floorY()) {
      B.y = floorY(); B.onFloor = true;
      if (B.state === 'fall') { if (B.vy > 500) { B.vy = -B.vy * 0.25; B.onFloor = false; return; } say(pick(DROP_REPLIES), 2.6); hearts(3, 16); setState('wave', 2); }
      else setState('idle', rand(1, 2));
      B.vy = 0;
    }
    syncWindow(); return;
  }
  switch (B.state) {
    case 'walk': {
      const fast = B.target != null;
      if (fast) B.dir = B.target > B.x ? 1 : -1;
      B.x += B.dir * (fast ? WALK_SPEED * 3.2 : WALK_SPEED) * dt;
      B.phase += dt * (fast ? 13 : 7.5);
      if (fast && Math.abs(B.x - B.target) < 4) { B.x = B.target; B.target = null; setState('wave', 2.4); say("Here I am! ❤️", 2.6); break; }
      if (B.x <= minX()) { B.x = minX(); B.dir = 1; }
      if (B.x >= maxX()) { B.x = maxX(); B.dir = -1; }
      if (B.until && B.t > B.until) { B.target = null; nextState(); }
      break;
    }
    case 'sleep':
      B.zT = (B.zT || 0) - dt;
      if (B.zT <= 0) { zzz(); B.zT = 1.1; }
      break;
    default:
      if (B.state === 'idle' && B.t > 1.2 && Math.random() < dt * 0.25) B.dir = -B.dir;   // looks around
      if (B.until && B.t > B.until) nextState();
  }
  // sweet messages every now and then (not while he's napping)
  const t = now();
  if (t >= nextMessageAt) {
    nextMessageAt = t + rand(MESSAGE_MINUTES[0], MESSAGE_MINUTES[1]) * 60;
    if (!B.sleeping && !bubble) { say(randomMessage()); if (B.state !== 'walk') setState('wave', 2.4); hearts(3, 18); }
  }
  syncWindow();
}

function render() {
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, W, H);
  const cx = bearX(), feetY = H - FOOT_PAD;
  if (B.onFloor && !B.dragging) {                      // soft shadow on the taskbar edge
    g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); g.ellipse(cx, feetY + 1, 26, 5, 0, 0, TAU); g.fill();
  }
  let pose = B.state;
  if (B.dragging) pose = 'dangle';
  else if (!B.onFloor) pose = B.state === 'fall' ? 'fall' : 'jump';
  else if (pose === 'hop' || pose === 'idle') pose = 'idle';
  drawBear(cx, feetY, pose, B.dir, now(), B.phase);
  drawParticles(cx, feetY);
  drawBubble(cx, feetY - (pose === 'sit' || pose === 'sleep' ? 118 : 134));
}

/* ---------- mouse: only the bear catches clicks, everything else goes through ---------- */
function overBear(px, py) {
  const cx = bearX(), feetY = H - FOOT_PAD;
  return px > cx - 38 && px < cx + 38 && py > feetY - 140 && py < feetY + 2;
}
function setThrough(on) { if (on !== clickThrough) { clickThrough = on; api.setClickThrough(on); } }
let press = null;
window.addEventListener('mousemove', (e) => {
  if (press) return;
  hover = overBear(e.clientX, e.clientY);
  setThrough(!hover);
  canvas.style.cursor = hover ? 'grab' : 'default';
});
document.documentElement.addEventListener('mouseleave', () => { if (!press) { hover = false; setThrough(true); } });
canvas.addEventListener('pointerdown', (e) => {
  if (!overBear(e.clientX, e.clientY)) return;
  canvas.setPointerCapture(e.pointerId);
  press = { sx: e.screenX, sy: e.screenY, offX: e.screenX - B.x, offY: e.screenY - B.y, t: now(), moved: false };
});
canvas.addEventListener('pointermove', (e) => {
  if (!press) return;
  if (!press.moved && Math.hypot(e.screenX - press.sx, e.screenY - press.sy) > 5) {
    press.moved = true; B.dragging = true; B.onFloor = false; B.target = null; bubble = null;
    if (B.sleeping) { B.sleeping = false; particles = []; }
    canvas.style.cursor = 'grabbing';
  }
  if (B.dragging) {
    B.x = clamp(e.screenX - press.offX, scr.workArea.x + 20, scr.workArea.x + scr.workArea.width - 20);
    B.y = clamp(e.screenY - press.offY, scr.workArea.y + 150, floorY());
    syncWindow();
  }
});
function release() {
  if (!press) return;
  const wasDrag = press.moved; press = null;
  if (wasDrag) { B.dragging = false; B.vy = 0; if (B.y >= floorY() - 1) { B.y = floorY(); B.onFloor = true; setState('idle', 1); } else { B.onFloor = false; setState('fall', 0); } }
  else pat();
  canvas.style.cursor = 'grab';
}
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', release);

/* ---------- messages from the app ---------- */
api.on('screen', (s) => applyScreen(s));
api.on('settings', (s) => { settings = s || settings; });
api.on('idle', (sec) => {
  idleSec = sec;
  if (!B.sleeping && sec >= NAP_AFTER_SECONDS) goToSleep();
  else if (B.sleeping && sec < 3) wakeUp();
});
api.on('command', (cmd) => {
  if (cmd === 'say') { if (B.sleeping) wakeUp(); else { say(randomMessage()); hearts(4, 18); if (B.onFloor && B.state !== 'walk') setState('wave', 2.4); } }
  else if (cmd === 'come') comeHere();
  else if (cmd === 'back') { setState('wave', 2.4); say("I'm back! ❤️", 3); }
  else if (cmd === 'hello-again') { if (B.sleeping) wakeUp(); say(`I'm already here, ${HER_NAME} ❤️`, 3.5); hearts(5, 20); }
});

/* ---------- start ---------- */
let last = now();
function frame() {
  const t = now(), dt = Math.min(0.05, t - last); last = t;
  update(dt); render();
  requestAnimationFrame(frame);
}
(async function start() {
  const [s, st] = await Promise.all([api.getScreen(), api.getSettings().catch(() => null)]);
  if (st) settings = st;
  applyScreen(s);
  B.x = s.workArea.x + s.workArea.width * rand(0.35, 0.65); B.y = floorY();
  await loadFace();
  nextMessageAt = now() + rand(MESSAGE_MINUTES[0], MESSAGE_MINUTES[1]) * 60;
  setState('wave', 3); say(greeting()); hearts(6, 22);
  syncWindow(); render();
  requestAnimationFrame(frame);
  api.ready();
})();
window.addEventListener('resize', resize);

// for testing
window.__pet = { B, say, pat, setState, goToSleep, wakeUp, comeHere, get bubble() { return bubble; }, get particles() { return particles; }, update, render };
