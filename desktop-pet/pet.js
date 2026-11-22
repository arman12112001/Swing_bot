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
// Hover over him and two buttons pop up: ❤️ Love and 👊 Beat. After picking one, clicking him
// (any mouse button) does that. Each click picks a different action.
// LOVE mode:
const LOVE_LINES = {
  kiss:    ['Mwah! 😘', 'Kisses for you! 💋', 'Mwah mwah mwah! 😚'],
  hug:     ['Big bear hug! 🤗', 'Come here, cutie! 🤗', 'Squeeeeze! 🧸'],
  hearts:  ['Love you! 💕', 'My heart goes boom for you 💓', 'All my love for you ❤️'],
  blush:   ['Hehe, stop it 🙈', "You're making me blush ☺️", 'Aww 🥰'],
  rose:    [`For you, ${HER_NAME} 🌹`, 'A rose for my rose 🌹'],
  jump:    ['Yay! 🥰', 'Best day ever! 🎉', 'Wheee! ❤️'],
  flykiss: ['Catch my kiss! 😘', 'Flying kiss for you! 💋'],
};
const MANY_PATS = `I love you sooo much, ${HER_NAME}! ❤️❤️❤️`;
// BEAT mode (all in good fun). Most hits knock him flat on his back, then he gets up again:
const BEAT_LINES = {
  hammer: ['Ouch! 😵', 'My head! 😵‍💫', 'Bonk?! 🥴'],
  punch:  ['Owww! 🥊', 'Knockout! 😵', 'Nice punch! 😅'],
  slap:   ['Hey! What was that for? 😳', 'Ouchie! 🥺', 'I deserved that 😅'],
  pillow: ['Pillow fight?! 😆', 'Feathers everywhere! 🪶', 'Not the pillow! 😂'],
  pan:    ["I'm a pancake now 🥞", 'Ow ow ow! 😖', 'Frying pan?! 🍳😵'],
  kick:   ['Wheee… ouch! 🙃', 'I can fly?! 😱', 'Ouch, my bum! 😣'],
  flick:  ['Ow, my forehead! 🥺', 'Hey! 😤', 'Tiny but painful 😢'],
};
// Hit him 5 times in a row and he sits down and cries until she gives him love…
const CRY_LINES = ['Waaah! 😭', 'You hurt me… 😢', 'Sniff sniff… 🥺', 'Nobody loves me 😭'];
const CRY_SECONDS = 10;
const COMFORT_LINES = ["Sniff… okay, I'm happy again ❤️", 'Hehe, I love you too 🥰', 'Hug fixes everything 🤗'];
// …and if she keeps hitting him while he cries, he runs off and hides at the edge of the screen.
const RUN_AWAY = 'Aaaah! Help! 😱';
const SORRY_LINES = ['Still love me? 👉👈', `Sorry ${HER_NAME}, I'll behave 🥺`, "Okay okay, I'm sorry! 🙏"];
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
let bubble = null, particles = [], hover = false, clickThrough = true, bearHidden = false, hideTimer = null;
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
function head(cx, bottom, Wd, tilt, fx) {
  const Hd = Wd * (face ? face.aspect : 1);
  g.save(); g.translate(cx, bottom - Hd / 2); if (tilt) g.rotate(tilt);
  for (const side of [-1, 1]) {                        // bear ears behind the head
    const ex = side * Wd * 0.34, ey = -Hd / 2 + Hd * 0.12, r = Wd * 0.19;
    g.beginPath(); g.arc(ex, ey, r, 0, TAU); g.fillStyle = OUTFIT.ear; g.fill(); g.lineWidth = 1.4; g.strokeStyle = OUTFIT.line; g.stroke();
    g.beginPath(); g.arc(ex, ey + r * 0.1, r * 0.5, 0, TAU); g.fillStyle = OUTFIT.earInner; g.fill();
  }
  if (face) g.drawImage(faceAt(face, Wd * BEAR_SCALE * dpr), -Wd / 2, -Hd / 2, Wd, Hd);
  else { g.fillStyle = '#d8a383'; g.beginPath(); g.arc(0, 0, Wd / 2, 0, TAU); g.fill(); g.lineWidth = 1.5; g.strokeStyle = OUTFIT.line; g.stroke(); }
  if (fx && fx.blush > 0) {                            // pink cheeks
    g.globalAlpha = 0.45 * fx.blush; g.fillStyle = '#ff5c8a';
    for (const side of [-1, 1]) { g.beginPath(); g.ellipse(side * Wd * 0.22, Hd * 0.17, Wd * 0.11, Wd * 0.065, 0, 0, TAU); g.fill(); }
    g.globalAlpha = 1;
  }
  if (fx && fx.tears > 0) {                            // tears running down his cheeks
    const tw = Wd * 0.075;
    g.fillStyle = 'rgba(80,165,255,0.85)';
    for (const side of [-1, 1]) {
      const ex = side * Wd * 0.17, ey = Hd * 0.05, len = Hd * (0.2 + 0.06 * Math.sin(now() * 6 + side)) * fx.tears;
      rr(ex - tw / 2, ey, tw, len, tw / 2); g.fill();
    }
  }
  if (fx && fx.slap) {                                 // red mark on the slapped cheek
    g.globalAlpha = 0.5 * Math.abs(fx.slap); g.fillStyle = '#ff2020';
    g.beginPath(); g.ellipse(Math.sign(fx.slap) * Wd * 0.2, Hd * 0.15, Wd * 0.13, Wd * 0.095, 0, 0, TAU); g.fill();
    g.globalAlpha = 1;
  }
  g.restore();
}
const EMOJI_FONT = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';
// The brown bear from the game (same body), with a few extra poses: sit, sleep, dangle, fall.
function drawBear(x, y, pose, dir, t, phase, fx) {
  const d = dir >= 0 ? 1 : -1;
  fx = fx || {};
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
  if (fx.arms === 'hug') { af = -0.95; ab = 0.95; }     // arms wrapped around his tummy
  else if (fx.arms === 'offer') { af = 1.35; }          // holding something out to her
  else if (fx.arms === 'throw') { af = 1.6 + Math.sin(t * 10) * 0.2; }
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
  if (fx.arms !== 'hug') limb(-d * (bw / 2 - 2), top + 8, 7, -d * ab, 6.5);
  if (!sit) leg(d * legX, stepF);
  rr(-bw / 2, top, bw, bot - top, Math.min(13, bw / 2, (bot - top) / 2)); g.fillStyle = OUTFIT.fur; g.fill(); g.lineWidth = 1.7; g.strokeStyle = OUTFIT.line; g.stroke();
  g.fillStyle = 'rgba(255,255,255,0.22)'; g.beginPath(); g.ellipse(0, (top + bot) / 2 + 2, bw * 0.3, (bot - top) * 0.28, 0, 0, TAU); g.fill();   // tummy
  if (sit) for (const side of [-1, 1]) {               // sitting: two round feet in front, paw pads showing
    const fx = side * (legX + 2.5), fy = -3.2;
    g.beginPath(); g.ellipse(fx, fy, 5.6, 4.6, 0, 0, TAU); g.fillStyle = OUTFIT.fur; g.fill(); g.lineWidth = 1.5; g.strokeStyle = OUTFIT.line; g.stroke();
    g.fillStyle = OUTFIT.pad; g.beginPath(); g.ellipse(fx, fy + 0.8, 2.6, 2.1, 0, 0, TAU); g.fill();
    for (const tx of [-2.6, 0, 2.6]) { g.beginPath(); g.arc(fx + tx, fy - 2.6, 0.95, 0, TAU); g.fill(); }
  }
  if (fx.arms === 'hug') limb(-d * (bw / 2 - 2), top + 8, 7, -d * ab, 6.5);
  limb(d * (bw / 2 - 2), top + 8, 7, -d * af, 6.5);
  if (fx.arms === 'offer' && fx.prop) {               // e.g. a rose in his paw
    const ang = -d * af, hx = d * (bw / 2 - 2) - Math.sin(ang) * 9, hy = top + 8 + Math.cos(ang) * 9;
    g.font = `15px ${EMOJI_FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(fx.prop, hx + d * 3, hy - 4);
  }
  const lean = fx.lean || 0;
  head(d * 5 * lean, top + 6 + (pose === 'sleep' ? 2 : 0) + lean * 3, 34, tilt + headTilt + (fx.headTilt || 0) + d * 0.3 * lean, fx);
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
function emojiBit(ch, x, y, vx, vy, size, life, grow) { particles.push({ kind: 'emoji', ch, x, y, vx, vy, s: size, grow: grow || 0, life, age: 0, rot: rand(-0.3, 0.3) }); }
function comic(text, x, y) { particles.push({ kind: 'comic', text, x, y, vx: 0, vy: -18, life: 0.9, age: 0, rot: rand(-0.25, 0.25) }); }
function feathers(n, x, y) { for (let i = 0; i < n; i++) particles.push({ kind: 'feather', x: x + rand(-10, 10), y: y + rand(-8, 8), vx: rand(-90, 90), vy: rand(-120, -30), life: rand(1.2, 2), age: 0, rot: rand(0, TAU), vr: rand(-5, 5) }); }
function sparks(n, x, y) { for (let i = 0; i < n; i++) { const a = rand(0, TAU), v = rand(60, 140); particles.push({ kind: 'star', x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.35, 0.6), age: 0, s: rand(3, 5.5) }); } }
function starPath(x, y, r) {
  g.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr2 = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr2, y + Math.sin(a) * rr2); }
  g.closePath();
}
function drawParticles(cx, feetY) {
  for (const q of particles) {
    const a = clamp(1 - q.age / q.life, 0, 1), x = cx + q.x, y = feetY + q.y;
    g.globalAlpha = a;
    if (q.kind === 'heart') { g.fillStyle = q.c; heartPath(x, y, q.s); g.fill(); }
    else if (q.kind === 'z') { g.fillStyle = '#5b6cff'; g.font = `800 ${Math.round(13 + q.age * 6)}px ${FONT}`; g.textAlign = 'center'; g.fillText('z', x, y); }
    else if (q.kind === 'emoji') {
      g.save(); g.translate(x, y); g.rotate(q.rot); g.font = `${Math.round(q.s + q.grow * q.age)}px ${EMOJI_FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(q.ch, 0, 0); g.restore();
    } else if (q.kind === 'feather') {
      g.save(); g.translate(x, y); g.rotate(q.rot + q.age * q.vr); g.fillStyle = '#ffffff'; g.strokeStyle = 'rgba(120,120,140,0.6)'; g.lineWidth = 0.8;
      g.beginPath(); g.ellipse(0, 0, 7, 2.6, 0, 0, TAU); g.fill(); g.stroke(); g.beginPath(); g.moveTo(-8, 0); g.lineTo(7, 0); g.stroke(); g.restore();
    } else if (q.kind === 'star') { g.fillStyle = '#ffd43b'; starPath(x, y, q.s); g.fill(); }
    else if (q.kind === 'comic') {
      const pop = Math.min(1, q.age / 0.12) * (1 + 0.15 * Math.max(0, 1 - q.age / 0.25));
      g.save(); g.translate(x, y); g.rotate(q.rot); g.scale(pop, pop);
      g.font = `900 22px ${FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
      g.lineWidth = 5; g.strokeStyle = '#4a1530'; g.strokeText(q.text, 0, 0); g.fillStyle = '#ffd43b'; g.fillText(q.text, 0, 0);
      g.restore();
    }
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
// Only during the build's click test: report what happens, and stand still so the test can click him.
function testEvent(d) { if (settings.test && api.event) api.event(d); }
window.addEventListener('error', (e) => testEvent({ type: 'error', message: String(e.message) }));
function nextState() {
  if (settings.test) { setState('idle', 5); return; }
  const h = new Date().getHours(), night = h >= 23 || h < 6;
  const r = Math.random();
  if (r < (night ? 0.25 : 0.45)) setState('walk', rand(4, 10));
  else if (r < (night ? 0.45 : 0.7)) setState('idle', rand(2, 5));
  else if (r < 0.93) setState('sit', rand(8, 20));
  else setState('wave', 2.2);
}
function wakeUp(byClick) {
  if (byClick) testEvent({ type: 'action', action: 'wake' });
  B.sleeping = false; particles = particles.filter((q) => q.kind !== 'z');
  setState('wave', 2.6); say(pick(WELCOME_BACK)); hearts(5, 20); play('laugh');
}
function goToSleep() {
  if (B.dragging || !B.onFloor || action || B.state === 'flee') return;
  B.sleeping = true; B.target = null; setState('sleep', 0); bubble = null;
}
function comeHere() {
  if (B.sleeping) wakeUp();
  action = null; B.flee = null; fleePending = false;
  B.target = scr.workArea.x + scr.workArea.width / 2; setState('walk', 30);
}

/* ---------- clicking him: Love mode or Beat mode (pick with the ❤️ / 👊 buttons that pop up on hover) ---------- */
let mode = 'love';
try { if (localStorage.getItem('loveBear.mode') === 'beat') mode = 'beat'; } catch (e) { /* no storage */ }
let action = null, beats = [], fleePending = false, cryPending = false;   // action = { type, kind, t, dur, side, hit }
const ACTION_DUR = { kiss: 1.7, hug: 1.9, hearts: 1.5, blush: 2.1, rose: 2.4, jump: 1.3, flykiss: 1.8, comfort: 2.4,
  hammer: 2.5, punch: 2.2, slap: 2.2, pillow: 2.3, pan: 2.1, kick: 2.4, flick: 1.3 };
const HIT_AT = { hammer: 0.24, punch: 0.15, slap: 0.15, pillow: 0.24, pan: 0.26, kick: 0.2, flick: 0.14 };
const COMIC = { hammer: 'BONK!', punch: 'POW!', slap: 'SLAP!', pillow: 'WHAP!', pan: 'BONNNG!', kick: 'BOOT!', flick: 'FLICK!' };
// Talking-Tom style: these hits knock him flat on his back; he lies there dizzy, then gets back up.
const FALL_AT = { hammer: 0.55, punch: 0.18, slap: 0.2, pillow: 0.3 };
const FALL_TIME = 0.32, LIE_TIME = 1.0, UP_TIME = 0.4, FALL_PIVOT = 28;
function shuffleBag(list) { let b = []; return () => { if (!b.length) b = list.slice().sort(() => Math.random() - 0.5); return b.pop(); }; }
const nextLove = shuffleBag(Object.keys(LOVE_LINES)), nextBeat = shuffleBag(Object.keys(BEAT_LINES));
function startAction(type, kind, side) {
  testEvent({ type: 'action', action: type + ':' + kind });
  if (B.sleeping) { B.sleeping = false; particles = particles.filter((q) => q.kind !== 'z'); }
  B.target = null; B.flee = null;
  action = { type, kind, t: 0, dur: ACTION_DUR[kind], side: side >= 0 ? 1 : -1, hit: false, n: 0 };
  B.dir = action.side;                          // he turns towards her
  setState('act', 0);
}
function crying() { return B.cryUntil > now(); }
function love(side) {
  if (B.sleeping) { wakeUp(true); return; }          // clicking a sleeping bear wakes him up
  if (crying() || B.state === 'cry') {            // love makes him stop crying
    B.cryUntil = 0; beats = []; cryPending = false;
    startAction('love', 'comfort', side); say(pick(COMFORT_LINES), 3); hearts(12, 26); play('giggle'); return;
  }
  const t = now(); pats = pats.filter((p) => t - p < 4); pats.push(t);
  if (pats.length >= 5) { pats = []; startAction('love', 'hearts', side); say(MANY_PATS); hearts(18, 28); play('giggle'); return; }
  const kind = nextLove();
  startAction('love', kind, side);
  say(pick(LOVE_LINES[kind]), 2.8); play('giggle');
  if (kind === 'hearts') hearts(10, 26);
  if (kind === 'jump' && B.onFloor) { B.vy = -340; B.onFloor = false; hearts(6, 20); }
}
function beat(side) {
  if (B.state === 'flee' && B.flee && B.flee.phase === 'run') return;   // already running away
  const t = now(), wasCrying = crying() || B.state === 'cry';
  beats = beats.filter((p) => t - p < 8); beats.push(t);
  startAction('beat', nextBeat(), side);
  if (wasCrying) B.cryUntil = Math.max(B.cryUntil, t + 6);   // hitting him while he cries keeps him crying
  if (beats.length >= 5) { beats = []; if (wasCrying) { fleePending = true; B.cryUntil = 0; } else cryPending = true; }
}
function doClick(side) { if (mode === 'beat') beat(side); else love(side); }
function setMode(m) {
  mode = m;
  try { localStorage.setItem('loveBear.mode', m); } catch (e) { /* ignore */ }
  if (m === 'love') { say('Love mode ❤️ Click me!', 2.2); hearts(5, 20); } else { say('Beat mode 👊 If you dare! 😅', 2.2); sparks(6, 0, -120); }
  btnUntil = now() + 2.5;
}
function startCry() {
  action = null; B.cryUntil = now() + CRY_SECONDS; B.cryLineT = 0; B.cryLine = 0; B.tearT = 0;
  setState('cry', 0); play('cry');
}
function fallAngle(a) {
  if (!a || FALL_AT[a.kind] == null || a.t < FALL_AT[a.kind]) return 0;
  const full = -a.side * 1.45, t = a.t - FALL_AT[a.kind];
  if (t < FALL_TIME) { const p = t / FALL_TIME; return full * p * p; }                       // falls, faster and faster
  if (t < FALL_TIME + LIE_TIME) { const b = t - FALL_TIME; return full * (1 - (b < 0.22 ? 0.09 * Math.sin(b / 0.22 * Math.PI) : 0)); }   // little bounce
  const u = clamp((t - FALL_TIME - LIE_TIME) / UP_TIME, 0, 1); return full * (1 - u) * (1 - u);   // gets back up
}
function fallSlide(ang) { return -Math.sign(ang) * 46 * Math.min(1, Math.abs(ang) / 1.45); }   // his feet slide forward as he goes down
function lying(a) { return !!a && FALL_AT[a.kind] != null && a.t > FALL_AT[a.kind] + FALL_TIME * 0.6 && a.t < FALL_AT[a.kind] + FALL_TIME + LIE_TIME + UP_TIME * 0.5; }
function updateAction(dt) {
  const a = action;
  if (!a) return;
  a.t += dt;
  const s = a.side, headY = -112, mouthX = B.dir * 10;
  if (a.type === 'beat' && !a.hit && a.t >= HIT_AT[a.kind]) {          // the moment of impact
    a.hit = true; play('atata');
    comic(COMIC[a.kind], s * 34, headY - 30);
    say(pick(BEAT_LINES[a.kind]), 2.4);
    if (a.kind === 'hammer' || a.kind === 'pan') { a.dizzy = true; sparks(8, 0, headY - 18); }
    if (a.kind === 'punch') { B.kv = -s * 200; sparks(7, s * 22, headY + 10); }
    if (a.kind === 'slap') sparks(5, s * 16, headY + 18);
    if (a.kind === 'pillow') feathers(16, s * 12, headY - 6);
    if (a.kind === 'kick') { B.vy = -560; B.vx = -s * 240; B.onFloor = false; sparks(6, s * 16, -30); }
    if (a.kind === 'flick') sparks(4, s * 10, headY - 8);
  }
  if (FALL_AT[a.kind] != null && !a.thud && a.t >= FALL_AT[a.kind] + FALL_TIME) {   // hits the floor
    a.thud = true; a.dizzy = true; comic('THUD!', -s * 40, -70); sparks(6, -s * 50, -10);
  }
  if (a.type === 'love') {
    if (a.kind === 'kiss' && a.n < 3 && a.t > 0.25 + a.n * 0.3) { a.n++; emojiBit('💋', mouthX + s * 10, headY + 22, s * rand(30, 60), rand(-70, -45), 16, 1.3, 6); }
    if ((a.kind === 'hug' || a.kind === 'comfort') && a.t > a.n * 0.35 && a.n < 5) { a.n++; hearts(2, 26); }
    if (a.kind === 'blush' && a.t > 0.3 + a.n * 0.5 && a.n < 3) { a.n++; hearts(2, 14); }
    if (a.kind === 'flykiss' && a.t > 0.5 && a.n < 1) { a.n++; emojiBit('💋', s * 24, headY + 26, s * 150, -35, 16, 1.2, 22); hearts(3, 12); }
  }
  if (a.t >= a.dur) {
    action = null;
    if (fleePending) { fleePending = false; startFlee(); }
    else if (cryPending) { cryPending = false; startCry(); }
    else if (crying()) setState('cry', 0);
    else if (B.onFloor) setState('idle', rand(1.5, 3));
  }
}
// After being hit while crying, he runs to the far side of the screen, hides half off the edge, then comes back to apologise.
function startFlee() {
  const wa = scr.workArea, goLeft = B.x > wa.x + wa.width / 2;
  B.cryUntil = 0;
  B.flee = { phase: 'run', tx: goLeft ? wa.x + 2 : wa.x + wa.width - 2, back: goLeft ? wa.x + 110 : wa.x + wa.width - 110, t: 0 };
  setState('flee', 0); say(RUN_AWAY, 2.2);
}
function updateFlee(dt) {
  const f = B.flee;
  if (!f) { setState('idle', 1); return; }
  f.t += dt;
  if (f.phase === 'run' || f.phase === 'back') {
    const tx = f.phase === 'run' ? f.tx : f.back, sp = f.phase === 'run' ? WALK_SPEED * 6 : WALK_SPEED * 1.5;
    B.dir = tx > B.x ? 1 : -1; B.x += B.dir * sp * dt; B.phase += dt * (f.phase === 'run' ? 18 : 8);
    if (Math.abs(B.x - tx) < sp * dt + 1) {
      B.x = tx;
      if (f.phase === 'run') { f.phase = 'hide'; f.t = 0; B.dir = f.back > B.x ? 1 : -1; }
      else { B.flee = null; setState('sit', rand(6, 12)); say(pick(SORRY_LINES), 4); hearts(4, 18); }
    }
  } else if (f.phase === 'hide' && f.t > 2.6) { f.phase = 'back'; f.t = 0; }
}
function updateCry(dt) {
  B.cryLineT -= dt;
  if (B.cryLineT <= 0) { say(CRY_LINES[B.cryLine++ % CRY_LINES.length], 2.2); B.cryLineT = 2.6; }
  B.tearT -= dt;
  if (B.tearT <= 0) {
    B.tearT = 0.18;
    for (const side of [-1, 1]) particles.push({ kind: 'tear', x: side * 14, y: -54, vx: side * rand(10, 35), vy: rand(-30, 5), life: 0.8, age: 0 });
  }
  if (!crying()) { B.cryUntil = 0; setState('sit', rand(5, 9)); say('Sniff… 🥺', 2.5); }
}
// How the body squashes, tilts and turns during an action.
function actionFx() {
  const fx = { sx: 1, sy: 1, rot: 0, fall: 0, lean: 0, blush: 0, slap: 0, headTilt: 0, arms: null, prop: null, tears: 0 };
  if (B.state === 'cry') { fx.tears = 1; fx.sy = 1 + 0.03 * Math.sin(now() * 16); fx.headTilt = 0.06 * Math.sin(now() * 9); }
  const a = action;
  if (!a) return fx;
  const t = a.t, s = a.side, after = (t0, len) => clamp(1 - (t - t0) / len, 0, 1) * (t >= t0 ? 1 : 0);
  fx.fall = fallAngle(a);
  switch (a.kind) {
    case 'hammer': { const k = after(0.24, 0.3); fx.sy = 1 - 0.3 * k; fx.sx = 1 + 0.16 * k; break; }
    case 'pan': { const k = t < 0.26 ? 0 : clamp(1 - (t - 0.9) / 0.6, 0, 1); fx.sy = 1 - 0.45 * k; fx.sx = 1 + 0.32 * k; break; }
    case 'slap': fx.headTilt = -s * 0.5 * after(0.15, 0.8); fx.slap = s * after(0.15, 1.8); break;
    case 'kick': if (!B.onFloor) fx.rot = -s * (t - 0.2) * 11; break;
    case 'flick': fx.headTilt = -s * 0.28 * after(0.14, 0.5); fx.rot = -s * 0.06 * after(0.14, 0.5); break;
    case 'kiss': fx.lean = Math.sin(clamp(t / 0.35, 0, 1) * Math.PI / 2) * clamp((a.dur - t) / 0.4, 0, 1); break;
    case 'hug': case 'comfort': { fx.arms = 'hug'; const p = 0.5 + 0.5 * Math.sin(t * 8); fx.sx = 1 + 0.045 * p; fx.sy = 1 - 0.03 * p; if (a.kind === 'comfort') fx.blush = clamp(t / 0.5, 0, 1) * clamp((a.dur - t) / 0.5, 0, 1); break; }
    case 'blush': fx.blush = clamp(Math.min(t / 0.3, (a.dur - t) / 0.5), 0, 1); fx.headTilt = s * 0.12 * fx.blush; break;
    case 'rose': fx.arms = 'offer'; fx.prop = '🌹'; break;
    case 'flykiss': if (t > 0.35) fx.arms = 'throw'; else fx.lean = 0.5; break;
  }
  return fx;
}
// The hammer, glove, hand, pillow, pan, foot and finger.
function drawProps(cx, feetY) {
  const a = action;
  if (!a || a.type !== 'beat') return;
  const t = a.t, s = a.side, top = feetY - 132, hit = HIT_AT[a.kind];
  const p = clamp(t / hit, 0, 1), e = p * p, out = clamp((t - hit - 0.25) / 0.3, 0, 1), alpha = 1 - out;
  if (alpha <= 0) return;
  const emoji = (ch, x, y, size, rot, flip) => {
    g.save(); g.globalAlpha = alpha; g.translate(x, y); if (rot) g.rotate(rot); if (flip) g.scale(-1, 1);
    g.font = `${size}px ${EMOJI_FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, 0, 0); g.restore();
  };
  const lerp = (u, v) => u + (v - u) * e;
  switch (a.kind) {
    case 'hammer': emoji('🔨', cx + s * lerp(64, 22), lerp(top - 56, top - 4), 40, s * lerp(-0.9, 0.35), s < 0); break;
    case 'pan': emoji('🍳', cx + s * lerp(30, 4), lerp(top - 80, top - 8), 46, s * lerp(-0.5, 0), s < 0); break;
    case 'punch': emoji('🥊', cx + s * (lerp(130, 36) + out * 50), feetY - 96, 38, 0, s > 0); break;
    case 'slap': emoji('🖐️', cx + s * (lerp(110, 26) + out * 30), feetY - 92, 34, s * lerp(0.6, -0.2), s > 0); break;
    case 'kick': emoji('🦶', cx + s * (lerp(90, 24) + out * 30), feetY - 26, 36, s * lerp(0.5, -0.3), s > 0); break;
    case 'flick': emoji('👉', cx + s * (lerp(46, 22)), top + 30, 26, 0, s > 0); break;
    case 'pillow': {
      g.save(); g.globalAlpha = alpha; g.translate(cx + s * lerp(70, 24), lerp(top - 40, top + 8)); g.rotate(s * lerp(-1.0, 0.25));
      rr(-24, -15, 48, 30, 11); g.fillStyle = '#fdfdff'; g.fill(); g.lineWidth = 1.6; g.strokeStyle = '#9aa3c7'; g.stroke();
      g.fillStyle = 'rgba(160,180,255,0.35)'; g.fillRect(-20, -3, 40, 6);
      g.restore(); break;
    }
  }
  g.globalAlpha = 1;
}
// Dizzy stars around his head (standing after a bonk, or lying on the floor after a knock-down).
function drawDizzy(cx, feetY) {
  const a = action;
  if (!a || !a.dizzy) return;
  const left = a.dur - a.t;
  if (left <= 0.3) return;
  const ang = fallAngle(a), squash = a.kind === 'pan' ? 40 : a.kind === 'hammer' && !ang ? 12 : 0;
  const px = Math.sign(ang) * FALL_PIVOT, vx = -px, vy = -97;                  // his head, turned with the fall
  const hx = cx + (ang ? fallSlide(ang) : 0) + px + vx * Math.cos(ang) - vy * Math.sin(ang), hy = feetY - 3 + vx * Math.sin(ang) + vy * Math.cos(ang) - (ang ? 0 : 26) + squash;
  g.globalAlpha = clamp(left / 0.5, 0, 1);
  for (let i = 0; i < 3; i++) {
    const k = a.t * 6 + i * TAU / 3, x = hx + Math.cos(k) * 26, y = hy + Math.sin(k) * 7;
    g.fillStyle = '#ffd43b'; starPath(x, y, 5.5); g.fill(); g.lineWidth = 1; g.strokeStyle = '#d69e00'; g.stroke();
  }
  g.globalAlpha = 1;
}

function update(dt) {
  B.t += dt;
  if (bubble) { bubble.t += dt; if (bubble.t > bubble.dur) bubble = null; }
  for (const q of particles) {
    q.age += dt; q.x += q.vx * dt; q.y += q.vy * dt;
    if (q.kind === 'heart') q.vy += 10 * dt;
    if (q.kind === 'feather') { q.vy += 60 * dt; q.vx *= 0.97; }
    if (q.kind === 'tear') q.vy += 320 * dt;
  }
  particles = particles.filter((q) => q.age < q.life);
  updateAction(dt);

  if (B.dragging) { syncWindow(); return; }
  if (B.kv) {                                          // knocked back by a punch
    B.x = clamp(B.x + B.kv * dt, minX(), maxX()); B.kv *= Math.exp(-7 * dt); if (Math.abs(B.kv) < 5) B.kv = 0;
  }
  if (!B.onFloor) {                                    // in the air: dropped, a little hop, or kicked
    B.vy = Math.min(B.vy + 1500 * dt, 1400); B.y += B.vy * dt;
    if (B.vx) B.x = clamp(B.x + B.vx * dt, minX(), maxX());
    if (B.y >= floorY()) {
      B.y = floorY(); B.onFloor = true; B.vx = 0;
      if (B.state === 'fall') { if (B.vy > 500) { B.vy = -B.vy * 0.25; B.onFloor = false; return; } say(pick(DROP_REPLIES), 2.6); hearts(3, 16); setState('wave', 2); }
      else if (B.state !== 'act' && B.state !== 'flee') setState('idle', rand(1, 2));
      B.vy = 0;
    }
    syncWindow(); return;
  }
  switch (B.state) {
    case 'act': if (!action) setState('idle', rand(1, 2)); break;
    case 'flee': updateFlee(dt); break;
    case 'cry': updateCry(dt); break;
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
  // sweet messages every now and then (not while he's napping, busy, crying or hiding)
  const t = now();
  if (t >= nextMessageAt) {
    nextMessageAt = t + rand(MESSAGE_MINUTES[0], MESSAGE_MINUTES[1]) * 60;
    if (!B.sleeping && !bubble && !action && B.state !== 'flee' && B.state !== 'cry') { say(randomMessage()); if (B.state !== 'walk') setState('wave', 2.4); hearts(3, 18); }
  }
  syncWindow();
}

function drawTears(cx, feetY) {
  for (const q of particles) {
    if (q.kind !== 'tear') continue;
    const x = cx + q.x, y = feetY + q.y, a = clamp(1 - q.age / q.life, 0, 1);
    g.globalAlpha = 0.85 * a; g.fillStyle = '#4da3ff';
    g.beginPath(); g.moveTo(x, y - 5); g.quadraticCurveTo(x + 3.2, y, x, y + 2.8); g.quadraticCurveTo(x - 3.2, y, x, y - 5); g.fill();
  }
  g.globalAlpha = 1;
}
let btnsWereShown = false;
function render() {
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, W, H);
  const cx = bearX(), feetY = H - FOOT_PAD;
  const fx = actionFx();
  if (B.onFloor && !B.dragging && !fx.fall) {          // soft shadow on the taskbar edge
    g.fillStyle = 'rgba(0,0,0,0.18)'; g.beginPath(); g.ellipse(cx, feetY + 1, 26, 5, 0, 0, TAU); g.fill();
  }
  let pose = B.state;
  if (B.dragging) pose = 'dangle';
  else if (!B.onFloor) pose = B.state === 'fall' || (action && action.kind === 'kick') ? 'fall' : 'jump';
  else if (fx.fall) pose = 'fall';
  else if (pose === 'flee') pose = B.flee && B.flee.phase === 'hide' ? 'idle' : 'walk';
  else if (pose === 'cry') pose = 'sit';
  else if (pose === 'hop' || pose === 'idle' || pose === 'act') pose = 'idle';
  g.save(); g.translate(cx, feetY);
  if (fx.fall) { const px = Math.sign(fx.fall) * FALL_PIVOT; g.translate(fallSlide(fx.fall) + px, -3); g.rotate(fx.fall); g.translate(-px, 3); }   // feet slide forward, tips over on one foot
  if (fx.rot) { g.translate(0, -50); g.rotate(fx.rot); g.translate(0, 50); }
  if (fx.sx !== 1 || fx.sy !== 1) g.scale(fx.sx, fx.sy);
  drawBear(0, 0, pose, B.dir, now(), B.phase, fx);
  g.restore();
  drawDizzy(cx, feetY);
  drawProps(cx, feetY);
  drawParticles(cx, feetY);
  drawTears(cx, feetY);
  drawBubble(cx, feetY - (pose === 'sit' || pose === 'sleep' ? 118 : 134));
  const shown = btnsShown();
  if (shown && !btnsWereShown) btnSince = now();
  btnsWereShown = shown;
  drawModeBtns();
}

/* ---------- the ❤️ Love / 👊 Beat buttons that pop up when the mouse is over him ---------- */
let btnUntil = 0, btnSince = 0;
function modeBtns() {
  const cx = bearX(), y = H - FOOT_PAD - 112;
  return [{ id: 'love', x: clamp(cx - 54, 16, W - 16), y, r: 14, ch: '❤️', label: 'Love' },
          { id: 'beat', x: clamp(cx + 54, 16, W - 16), y, r: 14, ch: '👊', label: 'Beat' }];
}
function btnsShown() { return now() < btnUntil && !B.dragging && !action && B.state !== 'flee'; }
function btnAt(px, py) { if (!btnsShown()) return null; return modeBtns().find((b) => Math.hypot(px - b.x, py - b.y) <= b.r + 5) || null; }
function drawModeBtns() {
  if (!btnsShown()) return;
  const pop = clamp((now() - btnSince) / 0.18, 0, 1), fade = clamp((btnUntil - now()) / 0.3, 0, 1);
  for (const b of modeBtns()) {
    const on = mode === b.id, sc = (0.5 + 0.5 * pop) * (on ? 1.1 : 1);
    g.save(); g.globalAlpha = fade; g.translate(b.x, b.y); g.scale(sc, sc);
    g.shadowColor = 'rgba(60,20,50,0.3)'; g.shadowBlur = 6; g.shadowOffsetY = 1;
    g.beginPath(); g.arc(0, 0, b.r, 0, TAU); g.fillStyle = on ? (b.id === 'love' ? '#ffe3ec' : '#ffead1') : '#ffffff'; g.fill();
    g.shadowColor = 'transparent';
    g.lineWidth = on ? 3 : 1.5; g.strokeStyle = on ? (b.id === 'love' ? '#ff4d79' : '#ff8a00') : '#d9c3cf'; g.stroke();
    g.font = `15px ${EMOJI_FONT}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(b.ch, 0, 1);
    g.font = `800 10px ${FONT}`; g.lineJoin = 'round'; g.lineWidth = 3; g.strokeStyle = '#ffffff'; g.strokeText(b.label, 0, b.r + 9);
    g.fillStyle = on ? (b.id === 'love' ? '#d6245a' : '#c25f00') : '#5a1d3a'; g.fillText(b.label, 0, b.r + 9);
    g.restore();
  }
  g.globalAlpha = 1;
}

/* ---------- mouse: only the bear (and his two buttons) catch clicks, everything else goes through ---------- */
function overBear(px, py) {
  const cx = bearX(), feetY = H - FOOT_PAD;
  if (px > cx - 38 && px < cx + 38 && py > feetY - 140 && py < feetY + 2) return true;   // where he stands (still counts while he's down, so fast clicking keeps hitting him)
  return lying(action) && px > cx - 150 && px < cx + 150 && py > feetY - 62 && py < feetY + 2;   // flat on the floor
}
function setThrough(on) { if (on !== clickThrough) { clickThrough = on; api.setClickThrough(on); testEvent({ type: 'through', on }); } }
let press = null;
// Is the mouse over him? Called with mouse moves inside the window, and with the cursor position the app
// checks itself many times a second (that keeps working even when the window lets clicks through).
function handleHover(x, y, inside) {
  if (bearHidden) { hover = false; setThrough(true); return; }
  if (press && now() - press.t > 4 && !B.dragging) press = null;   // a press that never finished: forget it
  if (press) return;
  const onBear = inside !== false && overBear(x, y), onBtn = inside !== false ? btnAt(x, y) : null;
  if (onBear || onBtn) btnUntil = now() + 2.2;
  hover = onBear || !!onBtn;
  setThrough(!hover);
  canvas.style.cursor = hover ? 'pointer' : 'default';
}
window.addEventListener('mousemove', (e) => handleHover(e.clientX, e.clientY, true));
window.addEventListener('mousedown', (e) => testEvent({ type: 'mousedown', button: e.button, x: e.clientX, y: e.clientY }), true);
document.documentElement.addEventListener('mouseleave', () => { if (!press) { hover = false; setThrough(true); } });
api.on('cursor', (c) => { if (c) handleHover(c.x, c.y, c.inside); });
api.on('mouse-reset', () => { press = null; hover = false; clickThrough = true; if (B.dragging) { B.dragging = false; B.onFloor = false; setState('fall', 0); } });
setInterval(() => { if (!press) api.setClickThrough(clickThrough); }, 3000);   // keep the app and the page in agreement
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('pointerdown', (e) => {
  if (bearHidden) return;
  const x = e.clientX, y = e.clientY, b = btnAt(x, y);
  testEvent({ type: 'down', button: e.button, x, y, over: overBear(x, y) });
  if (b) { setMode(b.id); return; }                    // any button on ❤️ / 👊 picks the mode
  if (!overBear(x, y)) return;
  if (e.button !== 0) e.preventDefault();
  const side = x >= bearX() ? 1 : -1;
  if (e.button !== 0) { press = { other: true, side, t: now() }; return; }   // right / middle click: just the action
  press = { sx: e.screenX, sy: e.screenY, offX: e.screenX - B.x, offY: e.screenY - B.y, t: now(), moved: false, side };
  try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* the page hadn't seen the mouse yet: fine, the click still counts */ }
});
canvas.addEventListener('pointermove', (e) => {
  if (!press || press.other) return;
  if (!press.moved && Math.hypot(e.screenX - press.sx, e.screenY - press.sy) > 5) {
    press.moved = true; B.dragging = true; B.onFloor = false; B.target = null; bubble = null; action = null; B.flee = null;
    fleePending = false; cryPending = false; B.cryUntil = 0; B.vx = 0; B.kv = 0;
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
  const pr = press; press = null;
  if (pr.moved) { B.dragging = false; B.vy = 0; if (B.y >= floorY() - 1) { B.y = floorY(); B.onFloor = true; setState('idle', 1); } else { B.onFloor = false; setState('fall', 0); } }
  else doClick(pr.side);
}
canvas.addEventListener('pointerup', release);
canvas.addEventListener('pointercancel', release);

/* ---------- messages from the app ---------- */
api.on('screen', (s) => applyScreen(s));
api.on('settings', (s) => { settings = Object.assign(settings, s || {}); });
api.on('idle', (sec) => {
  idleSec = sec;
  if (!B.sleeping && sec >= NAP_AFTER_SECONDS) goToSleep();
  else if (B.sleeping && sec < 3) wakeUp();
});
api.on('command', (cmd) => {
  if (cmd === 'say') { if (B.sleeping) wakeUp(); else { say(randomMessage()); hearts(4, 18); if (B.onFloor && B.state !== 'walk' && !action) setState('wave', 2.4); } }
  else if (cmd === 'come') comeHere();
  else if (cmd === 'bye') {
    action = null; B.flee = null; B.cryUntil = 0; B.sleeping = false; if (B.onFloor) setState('wave', 2); say('Bye bye! 👋', 1.6);
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { bearHidden = true; bubble = null; particles = []; press = null; hover = false; setThrough(true); testEvent({ type: 'hidden' }); }, 1300);
  }
  else if (cmd === 'back') {
    clearTimeout(hideTimer); bearHidden = false; clickThrough = true; api.setClickThrough(true);
    if (B.onFloor) setState('wave', 2.4); say("I'm back! ❤️", 3); hearts(5, 20); testEvent({ type: 'shown' });
  }
});

/* ---------- start ---------- */
let last = now();
function frame() {
  const t = now(), dt = Math.min(0.05, t - last); last = t;
  if (bearHidden) {                                     // hidden: draw nothing, check back a few times a second
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, canvas.width, canvas.height);
    setTimeout(frame, 250); return;
  }
  update(dt); render();
  requestAnimationFrame(frame);
}
function showTipOnce() {
  let seen = false;
  try { seen = localStorage.getItem('loveBear.tip.v12') === '1'; localStorage.setItem('loveBear.tip.v12', '1'); } catch (e) { /* ignore */ }
  if (seen) return;
  setTimeout(() => say('Hover over me and pick ❤️ Love or 👊 Beat, then click me! 😊', 7), 4500);
  setTimeout(() => say(`To hide me or bring me back: ${settings.hotkey ? 'press ' + settings.hotkey + ' or ' : ''}open Love Bear on the desktop 👋`, 8), 12500);
}
(async function start() {
  const [s, st] = await Promise.all([api.getScreen(), api.getSettings().catch(() => null)]);
  if (st) settings = st;
  applyScreen(s);
  B.x = s.workArea.x + s.workArea.width * rand(0.35, 0.65); B.y = floorY();
  await loadFace();
  nextMessageAt = now() + rand(MESSAGE_MINUTES[0], MESSAGE_MINUTES[1]) * 60;
  setState('wave', 3); say(greeting()); hearts(6, 22);
  if (settings.test) setInterval(() => testEvent({ type: 'pos', x: Math.round(B.x), y: Math.round(B.y - 60), state: B.state, bubble: bubble && bubble.text }), 400);
  else showTipOnce();
  syncWindow(); render();
  requestAnimationFrame(frame);
  api.ready();
})();
window.addEventListener('resize', resize);

// for testing
window.__pet = { B, say, love, beat, doClick, setMode, setState, goToSleep, wakeUp, comeHere, startAction, startCry, fallAngle,
  get mode() { return mode; }, get hidden() { return bearHidden; }, get action() { return action; }, get bubble() { return bubble; }, get particles() { return particles; }, update, render };
