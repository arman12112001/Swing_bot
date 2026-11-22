# Love Bear 🐻❤️

A little brown bear with your face that lives on her Windows laptop. He walks along the top of the taskbar, sits down, waves, and every 20–35 minutes says something sweet in a speech bubble. Clicks go straight through to whatever she's working on; only the bear himself reacts to the mouse.

**What she can do with him**
- **Click him:** hearts and a cute reply. Click him five times quickly for a surprise.
- **Drag him** anywhere and let go: he falls back down to the taskbar.
- When she's away from the laptop for 2 minutes he **naps** (Zzz) and says "Welcome back!" when she returns.
- **Tray icon** (his face, near the clock; it may be under the **^** arrow): *Say something*, *Come here*, *Hide for 1 hour*, *Sound* (off at first), *Start with Windows* (on at first), *Quit*.

## Install it on her laptop

1. Open the repo on GitHub → **Releases** (right side of the repo page) → **Love Bear** → download `LoveBear-Setup-1.0.0.exe`.
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
```

- **His face:** replace `assets/me.png` with another cut-out PNG (transparent background).
- **Sounds:** `assets/giggle.mp3` (when she clicks him) and `assets/laugh.mp3` (welcome back). They're off until she turns on *Sound* in the tray menu.

After a change, raise `"version"` in `package.json` (for example to `1.0.1`) and push. GitHub builds a new installer on its own (the **Actions** tab shows progress; it takes about 5 minutes) and puts it on the Releases page. Install the new one over the old one.

## Try it on a computer

```bash
cd desktop-pet
npm install
npm start
```
