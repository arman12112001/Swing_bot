# Love Bear 🐻❤️

A little brown bear with your face that lives on her Windows laptop. He walks along the top of the taskbar, sits down, waves, and every 20–35 minutes says something sweet in a speech bubble. Clicks go straight through to whatever she's working on; only the bear himself reacts to the mouse.

**What she can do with him**
- **Left-click him = love:** each click is different: kisses 💋, a big hug 🤗, hearts, blushing, a rose 🌹, a happy jump, a flying kiss. Five quick clicks for a surprise.
- **Right-click him = beat him up** (all in fun): each click is different: hammer bonk 🔨 (dizzy stars), punch 🥊, slap 🖐️ (red cheek), pillow whack (feathers), frying pan 🍳 (flat as a pancake), kick 🦶 (he goes flying), forehead flick 👉. Hit him five times quickly and he runs away to hide at the edge of the screen, then comes back to apologise.
- **Drag him** anywhere and let go: he falls back down to the taskbar.
- **Hide him:** hold the mouse over him and a small **✕** appears beside his ear. Click it: *Hide for 1 hour* or *Close Love Bear*. (After closing, open **Love Bear** from the Start menu or desktop to bring him back.)
- When she's away from the laptop for 2 minutes he **naps** (Zzz) and says "Welcome back!" when she returns.
- **Tray icon** (his face, near the clock; it may be under the **^** arrow): *Say something*, *Come here*, *Hide for 1 hour*, *Sound* (off at first), *Start with Windows* (on at first), *Quit*.

## Install it on her laptop

1. Open the repo on GitHub → **Releases** (right side of the repo page) → **Love Bear** → download the newest `LoveBear-Setup-….exe`.
2. Open the file on her laptop. Because the app isn't code-signed, Windows shows **"Windows protected your PC"**: click **More info → Run anyway**. This happens only once.
3. It installs in a few seconds (no admin needed) and the bear appears. He starts by himself every time she turns on the laptop.

To remove it: Windows **Settings → Apps → Installed apps → Love Bear → Uninstall**.

## Change things

Everything is at the top of `pet.js`:

```js
const HER_NAME = 'Chan';
const MESSAGE_MINUTES = [20, 35];   // a sweet message every 20-35 minutes
const NAP_AFTER_SECONDS = 120;      // naps when she's away this long
const BEAR_SCALE = 1.75;            // size
const WALK_SPEED = 42;              // pixels per second
const MESSAGES = [ ... ];           // the sweet messages; add or change lines here
const LOVE_LINES = { ... };         // what he says for each left-click action
const BEAT_LINES = { ... };         // what he says for each right-click action
```

- **His face:** replace `assets/me.png` with another cut-out PNG (transparent background).
- **Sounds:** `assets/giggle.mp3` (love), `assets/atata.mp3` (when he gets hit) and `assets/laugh.mp3` (welcome back). They're off until she turns on *Sound* in the tray menu.

After a change, raise `"version"` in `package.json` (for example to `1.0.1`) and push. GitHub builds a new installer on its own (the **Actions** tab shows progress; it takes about 5 minutes) and puts it on the Releases page. Install the new one over the old one.

## Try it on a computer

```bash
cd desktop-pet
npm install
npm start
```
