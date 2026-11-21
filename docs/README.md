# Super Love Run

A small side-scrolling platformer made for phones. Your girlfriend is the hero, your friends are the enemies, and you're waiting at the castle at the end.

- One file: `index.html` (HTML5 Canvas + plain JavaScript, no frameworks, no build step)
- Two levels: **Sunny Hills** (day) and **Starry Night** (harder, night theme)
- Works offline and installs to the home screen (PWA: `manifest.json` + `sw.js`)
- Sounds are generated in code, so there are no audio files. 🔇 button (or `M`) mutes.

```
docs/
├── index.html        the whole game
├── manifest.json     app name, icon, landscape/fullscreen for "Add to Home screen"
├── sw.js             offline cache
├── icons/            home-screen icons (192, 512, maskable 512)
└── faces/            the photos
    ├── hero.png      the player (your girlfriend)
    ├── me.png        you, waiting at the castle
    └── enemy1.png … enemy10.png   friends (enemies)
```

## Controls

| | Phone (landscape) | Keyboard |
|---|---|---|
| Run | ◀ ▶ buttons, bottom-left | ← → or A / D |
| Jump | tap anywhere on the right half (hold = higher) | Space, ↑, W, Z |
| Pause | ⏸ top-right | P or Esc |
| Mute | 🔊 top-right | M |

You can press run and jump at the same time (multitouch). If the phone is held upright, the game asks you to rotate it.

## Swap the faces

1. Put photos in `docs/faces/` with these exact names:
   - `hero.png`: the player
   - `me.png`: the person at the castle
   - `enemy1.png`, `enemy2.png`, … up to `enemy10.png`: friends. Gaps are fine (for example, only 1, 3 and 4). Each friend gets their own body colour, and enemies cycle through all the friends.
   - `.jpg` files work too (for example `enemy2.jpg`).
2. For best results, crop each photo to a **square around the face** (forehead to chin, a little hair). The game cuts a circle from the middle of the image, and from slightly above the middle for tall photos. Around 300×300 px is plenty.
3. If a face is still a bit off, adjust it in `index.html` without editing the photo:
   ```js
   const FACE_TWEAKS = { enemy3: { zoom: 1.2, x: 0.05, y: -0.05 } };   // zoom in, shift right & up
   ```
4. If a photo is missing, the game draws a coloured circle with initials, so it never breaks. The initials come from `NAMES` in `index.html`.

The home-screen icon (`icons/`) uses the hero photo. Replace those three PNGs if you change the hero.

## Change the text

Everything is at the top of the `<script>` in `index.html`:

```js
const GAME_TITLE          = "Super Love Run";
const GAME_TAGLINE        = "Run, jump and reach the castle!";
const WIN_MESSAGE         = "You made it! ❤️";
const WIN_SUBTEXT         = "Thanks for running all the way to me 💕";
const LEVEL_CLEAR_MESSAGE = "Level clear! ❤️";
const START_LIVES         = 3;
```

The name under the home-screen icon comes from `name` / `short_name` in `manifest.json`.

## Edit the levels

Levels are in `const LEVELS = [ … ]` in `index.html`. Each level is 13 strings (rows, top to bottom). Every character is one tile, and the rows can be any length.

```
.  empty            #  ground            B  brick (breaks when hit from below)
?  coin block       *  1-UP heart block  X  stone block (use for stairs)
o  coin             =  thin platform (you can jump up through it)
P  pipe (draw it 2 wide, any height)     ^  spikes
E  walker enemy     F  fast enemy        J  hopping enemy
M  moving platform, left/right 4 tiles   (MMM = 3 tiles wide)
V  moving platform, up/down 3 tiles      (VVV = 3 tiles wide)
S  start            C  checkpoint flag   G  goal flagpole   K  castle (5 tiles wide)
```

Example (the bottom of a level):

```
"..S.......?.....E......C......XX.....G....K.....",
"################....############################",
"################....############################",
```

Rules of thumb so the level stays beatable:
- Ground is normally the last 2 rows. Put `S`, enemies, `C`, `G`, `K` on the row just above the ground.
- The hero can jump about **4 tiles up** and across gaps up to **4 tiles** (5 is very hard).
- The hero is about 1.5 tiles tall. Leave **3 empty rows** under blocks you want to walk under and hit.
- A pit is just a missing column of `#`. Enemies turn around at edges and walls.
- `M` platforms start where you draw them and slide 4 tiles right. Put them at the left edge of a pit.
- Leave about 12 tiles of ground after the castle.

Add a level by copying a `{ name, theme, time, map }` block. `theme` is `"day"` or `"night"`, and `time` is the timer in seconds. The last level in the list shows the big "You made it!" ending. Earlier levels show "Level clear!" and a Next Level button.

## Try it on your computer

Open `index.html` directly and it plays, but offline mode and installing need a web server:

```bash
cd docs
python3 -m http.server 8000
# then open http://localhost:8000
```

## Put it online for free and install it on Android

> ⚠️ Anything you host this way is **public to anyone with the link**, including the photos. Ask your friends if that's OK. If you'd rather keep the repo private, use Netlify Drop (option B).

### Option A: GitHub Pages

1. Make sure the `docs/` folder is on your `main` branch (merge this branch, or pick this branch in step 3).
2. On GitHub, open the repo → **Settings** → **Pages**.
3. Under *Build and deployment*, choose **Deploy from a branch**, branch **main**, folder **/docs**, then **Save**.
4. After a minute your game is at `https://<your-username>.github.io/<repo-name>/`.

Free GitHub Pages needs the repository to be **public**.

### Option B: Netlify Drop (no account settings, works with a private repo)

1. Go to <https://app.netlify.com/drop>.
2. Drag the **`docs` folder** onto the page.
3. You get a link like `https://something-random.netlify.app`. Sign up (free) if you want to keep it permanently or rename it.

### Install on the phone

1. Open the link in **Chrome** on Android.
2. Tap **⋮** → **Add to Home screen** (or **Install app**).
3. Open it from the home screen. It starts fullscreen in landscape and works without internet after the first launch.

**Updating:** after you upload new photos or changes, the installed game shows them the next time it's opened (sometimes the time after that). To force every phone to refresh right away, change `CACHE = 'love-run-v1'` in `sw.js` to `'love-run-v2'`.

## Troubleshooting

- **No sound:** tap the screen once. Phones only allow sound after a touch. Also check the 🔊 button and the phone's media volume.
- **Feels slow on an old phone:** lower `MAX_DPR` in `index.html` to `1.5`. The game also lowers it by itself if frames drop.
- **A face didn't change:** check the file name (lowercase, e.g. `enemy3.png`), then reopen the app twice or bump the `CACHE` version.
