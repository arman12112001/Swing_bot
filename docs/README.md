# Super Love Run

A small side-scrolling platformer made for phones. Your girlfriend is the hero (a cute white panda-bear body with little legs, a bow and a yellow side purse, with her face), your friends are the enemies, and you (a brown bear body with your face) are waiting at the castle at the end.

- One file: `index.html` (HTML5 Canvas + plain JavaScript, no frameworks, no build step)
- Three long levels: **Sunny Hills** (day), **Starry Night** (harder, night) and **Dragon Mountain** (hardest, lava, with a **dragon boss**)
- Power-ups: 🎂 **red velvet cake**, 🥦 **broccoli** and 💖 **spiky heart shield** (15 seconds each), and 🍕 **pizza slice** (30 seconds). Each one appears **once per level**, except pizza, which appears **twice in level 3** (the second one is right before the dragon).
- **5 hearts at the start of every level**. After losing a heart she restarts from the last checkpoint, and every coin and power-up block comes back.
- At each checkpoint your face pops up at the top: *"Let's go girl.. i am waiting for u ❤️"*
- Enemies: walkers, fast walkers, hoppers, **flyers**, **tortoises** with kickable shells, friends **peeping out of green pipes**, a friend **on a cloud** dropping spiky balls, **cannons** firing rockets and **fish** leaping through bridges
- Fire: spinning **fire bars** (lots in level 3) and **lava bubbles** jumping out of the lava
- Every level has every enemy type, moving platforms, spikes and checkpoints
- At the end of each level she meets you at the castle and you **kiss** 💋
- **Big ending** after level 3: you walk off together hand in hand into a sunset while fireworks spell her name in the sky
- Cute **voices**: she cries when she loses a life, laughs when she meets you, says "a-ta-taa!" at `?` boxes, grumbles at broccoli and giggles at pizza and cake
- **Progress is saved** after each level, so you can continue instead of starting over
- Works offline and installs to the home screen (PWA: `manifest.json` + `sw.js`)
- Sound effects are generated in code; the voices are short clips in `sounds/`. The 🔊 button (or `M`) mutes.

```
docs/
├── index.html        the whole game
├── manifest.json     app name, icon, landscape/fullscreen for "Add to Home screen"
├── sw.js             offline cache
├── icons/            home-screen icons (192, 512, maskable 512)
├── sounds/           optional voice clips (see Voices)
└── faces/            the face cut-outs
    ├── hero.png      the player (your girlfriend)
    ├── me.png        you, waiting at the castle
    ├── dragon.png    the face on the dragon boss (level 3)
    └── enemy1.png … enemy10.png   friends (enemies)
```

## Controls

| | Phone (landscape) | Keyboard |
|---|---|---|
| Run | ◀ ▶ buttons, bottom-left | ← → or A / D |
| Jump | tap anywhere on the right half (hold = higher) | Space, ↑, W, Z |
| Throw fire (after pizza) | 🔥 button next to the jump button | F, X, J or Shift |
| Pause | ⏸ top-right | P or Esc |
| Mute | 🔊 top-right | M |

Multitouch works, so you can run, jump and throw at the same time. If the phone is held upright, the game asks you to rotate it.

## Power-ups and enemies

Power-ups come out of `?` blocks when you hit them from below.

| | What it does |
|---|---|
| 🎂 Red velvet cake | She grows big and chubby for **15 seconds** (`CAKE_SECONDS`). Any enemy that touches her dies. She flickers just before shrinking back. |
| 🍕 Pizza slice | Orange cap. She can **throw bouncing fireballs** that knock out any enemy, for **30 seconds** (`PIZZA_SECONDS`). A hit during that time only takes the pizza away, not a life. |
| 🥦 Broccoli | Oops! She shrinks to **tiny** for **15 seconds** (`BROCCOLI_SECONDS`), then grows back. |
| 💖 Heart shield | She holds a **red heart with silver spikes** in front of her for **15 seconds** (`SHIELD_SECONDS`). Any enemy that runs into the heart (or into her) dies, and nothing can hurt her (enemies, fire bars, lava bubbles, spikes). Falling into a pit or into lava still costs a heart. The heart blinks just before it disappears, and a bar at the top shows how long is left. It's never placed near the dragon. |
| ❤️ Heart | +1 heart. 100 coins also give +1 heart. |

Every level starts with **5 hearts**. Losing one sends her back to the last checkpoint (or the start), and all the coins, `?` blocks and power-up blocks in the level come back, so she can power up again.

| Enemy | How to beat it |
|---|---|
| Walker / fast walker | Jump on its head. |
| Hopper (small wings) | Jump on it between hops. |
| Flyer (big wings) | Stomp it once and it loses its wings and walks. Stomp again to finish it. |
| Tortoise (green shell) | Stomp it and it hides in its shell. Touch the shell to **kick** it; a sliding shell knocks out every enemy it hits. Watch out when it bounces back! The tortoise comes out again if you leave the shell alone. |
| Friend in a pipe | Comes up out of green pipes. You can't stomp it, so wait until it goes down; it stays hidden while you stand right next to the pipe. Fireballs, shells and cake power beat it. |
| ☁️ Friend on a cloud | Follows her from above and drops **spiky balls**. Stomp the cloud to get rid of it. Never stomp a spiky ball (spikes!); use fireballs, a shell or cake power. |
| 🚀 Cannon | Fires rockets at her. Jump over them or stomp them. |
| 🐟 Fish | Leap up through the gap in bridges. Stomp them or dodge. |
| 🔥 Fire bar / lava bubble | Can't be beaten, only dodged: time your jump. |
| 🐉 Dragon (end of level 3) | **Aims her fire at you**, even if you stand on the bricks, but the flames are slow enough to jump over. **Stomp her head** (2 damage), so 3 stomps win. Pizza fireballs do 0.5, and there's a pizza block right before the fight. She has 6 health (`DRAGON_HP`) and gets a bit faster when she's hurt. Beat her and the gate to the castle opens. |

## Saved progress and game over

- When you finish a level, the game saves the level you're on. Next time, the title screen shows **Continue · Level 2** (or 3) or **New Game**.
- Starting from Level 1 (New Game) resets the save, so it never offers a level you haven't reached in your current game.
- After **Game Over** you get two choices: **Start from Level N** (the level you were on) or **Start from Level 1**.
- The save, best score and mute are stored in the browser, so they're kept per phone and are lost if you clear Chrome's site data.

## Voices

The voices are short clips in `docs/sounds/`, cut from your Bubu sounds mp3:

| File | When it plays | Taken from (seconds in the mp3) |
|---|---|---|
| `cry.mp3` | she loses a life | 12–14 |
| `laugh.mp3` | she meets you at the castle | 17.35–19.70 (laughing) |
| `giggle.mp3` | she eats pizza or red velvet cake | 17.35–18.50 (shorter laugh) |
| `atata.mp3` | she hits a `?` box | 5.5–7.5 |
| `angry.mp3` | she eats broccoli | 10.20–11.15 ("hmph hmph") |

To change a voice, replace that file with another short `.mp3` or `.m4a` clip with the same name. A missing clip just stays silent. Clips need the game to be online (GitHub Pages or Netlify), not opened as a file. After replacing clips, bump `CACHE` in `sw.js` so installed copies pick them up.
## Swap the faces

1. Put pictures in `docs/faces/` with these exact names:
   - `hero.png`: the player
   - `me.png`: the person at the castle
   - `dragon.png`: the face on the dragon boss. If it's missing, the game uses one of the friends.
   - `enemy1.png`, `enemy2.png`, … up to `enemy10.png`: friends. Gaps are fine (this game has no enemy2). Each friend gets their own colour, and enemies cycle through all the friends.
2. **Best: transparent PNG cut-outs** (just the head, background removed), like the ones included. The game uses them exactly as cut, with a thin outline, and never crops them into a circle. To make one, use your phone gallery's "remove background" / "lift subject" feature or any free background remover, crop close around the head, and save as PNG.
3. A normal photo with a background (JPG, or a PNG without transparency) still works, but it gets a circle crop. You can force one style for every picture with `FACE_SHAPE = "cutout"` or `"circle"` in `index.html`. `FACE_TWEAKS` adjusts the framing of circle photos.
4. If a picture is missing, the game draws a coloured circle with initials, so it never breaks. The initials come from `NAMES` in `index.html`.

The home-screen icon (`icons/`) uses the hero picture. Replace those three PNGs if you change the hero.

## Change the text

Everything is at the top of the `<script>` in `index.html`:

```js
const GAME_TITLE          = "Super Love Run";
const GAME_TAGLINE        = "Run, jump and reach the castle!";
const WIN_MESSAGE         = "You made it! ❤️";
const WIN_SUBTEXT         = "Thanks for running all the way to me 💕";
const LEVEL_CLEAR_MESSAGE = "Level clear! ❤️";
const START_LIVES         = 5;     // hearts at the start of every level
const CAKE_SECONDS        = 15;
const PIZZA_SECONDS       = 30;
const BROCCOLI_SECONDS    = 15;
const SHIELD_SECONDS      = 15;
const DRAGON_HP           = 6;
const HER_NAME            = "CHAN";      // spelled in fireworks at the very end
const CHECKPOINT_MESSAGE  = "Let's go girl.. i am waiting for u ❤️";
```

`HER_NAME` looks best at up to about 10 letters. Longer names are shrunk to fit the screen.

The name under the home-screen icon comes from `name` / `short_name` in `manifest.json`.

## Edit the levels

Levels are in `const LEVELS = [ … ]` in `index.html`. Each level is 13 strings (rows, top to bottom). Every character is one tile, and the rows can be any length.

```
.  empty            #  ground            B  brick (breaks when hit from below)
?  coin block       *  1-UP heart block  X  stone block (use for stairs)
R  red velvet cake block   Z  pizza block   Q  broccoli block   +  heart shield block
o  coin             =  thin platform (you can jump up through it)      ^  spikes
P  pipe (draw it 2 wide, any height)
Y  friend peeping out of a pipe: put it on the tile right above the pipe's LEFT half
E  walker   F  fast walker   J  hopper   W  flyer   T  tortoise
M  moving platform, left/right 4 tiles   (MMM = 3 tiles wide)
V  moving platform, up/down 3 tiles      (VVV = 3 tiles wide)
~  lava (draw it where the ground would be, in a pit)    !  lava with a jumping lava bubble
A  friend on a cloud   N  cannon   I  fire bar block   H  fish jump up here (top row, above a bridge or pit)
D  dragon boss      L  gate that opens when the dragon is beaten
S  start            C  checkpoint flag   G  goal flagpole   K  castle (5 tiles wide)
```

Example (the bottom of a level, with a pipe friend and a tortoise):

```
"..........?R?..........Y................................",
".......................PP...............................",
"..S..........E.........PP.....T.....C......XX....G....K.",
"#################....###################################",
"#################....###################################",
```

Rules of thumb so the level stays beatable:
- Ground is normally the last 2 rows. Put `S`, walkers, `T`, `C`, `G`, `K` on the row just above the ground. Put `W` flyers in the air where they should hover.
- The hero can jump about **5 tiles up** and across gaps up to **4 tiles**.
- Leave **4 empty rows** under blocks (block row 6 with ground at row 11) so she can walk under them, hit them, and stomp enemies below them.
- Don't put a pipe or a tall step right before a pit: jumping over it tends to land you in the hole.
- `M` platforms start where you draw them and slide 4 tiles right. Put them at the left edge of a pit.
- Leave about 12 tiles of ground after the castle.

Add a level by copying a `{ name, theme, time, map }` block. `theme` is `"day"`, `"night"` or `"lava"`, and `time` is the timer in seconds. The last level in the list shows the big "You made it!" ending. Earlier levels show "Level clear!" and a Next Level button.

## Try it on your computer

Open `index.html` directly and it plays. Offline mode and installing need a web server:

```bash
cd docs
python3 -m http.server 8000
# then open http://localhost:8000
```

## Put it online for free and install it on Android

> ⚠️ Anything you host this way is **public to anyone with the link**, including the photos. If you'd rather keep the repo private, use Netlify (option B).

### Option A: GitHub Pages

1. On GitHub, open the repo → **Settings** → **Pages**.
2. Under *Build and deployment*, choose **Deploy from a branch**, pick the branch that has the `docs/` folder, folder **/docs**, then **Save**. (If you choose **/ (root)** instead, the small `index.html` at the repo root forwards visitors to `docs/`.)
3. After a minute or two your game is at `https://<your-username>.github.io/<repo-name>/`.

Free GitHub Pages needs the repository to be **public**.

### Option B: Netlify (free, works with a private repo)

1. Make a free account at netlify.com and stay logged in. Sites dropped without an account are deleted after a short time.
2. Go to <https://app.netlify.com/drop> and drag the **`docs` folder** onto the page.
3. You get a link like `https://something.netlify.app`. Rename it in the site settings if you like. To update later, open the site → **Deploys** and drag the folder again.

### Install on the phone

1. Open the link in **Chrome** on Android.
2. Tap **⋮** → **Add to Home screen** (or **Install app**).
3. Open it from the home screen. It starts fullscreen in landscape and works without internet after the first launch.

**Updating:** when there's internet, the game always loads its newest version. If the app was left open in the background, it checks for an update when it comes back to the screen and reloads itself on the title screen (never in the middle of a level). The title screen shows **Version N**, so you can see which version a phone is running. With every change, bump both `CACHE = 'love-run-v14'` in `sw.js` and `GAME_VERSION = 14` in `index.html` to the next number. GitHub Pages can take a minute or two to publish a change.

Phones that still have a version older than 14 show the old game one more time: open it, wait a few seconds, close it completely (swipe it away from recent apps) and open it again.

## Troubleshooting

- **No sound:** tap the screen once. Phones only allow sound after a touch. Also check the 🔊 button and the phone's media volume.
- **Feels slow on an old phone:** lower `MAX_DPR` in `index.html` to `1.5`. The game also lowers it by itself if frames drop.
- **A face didn't change:** check the file name (lowercase, e.g. `enemy3.png`), then bump `CACHE` in `sw.js` and close and reopen the app.
- **Want to start over from Level 1:** tap **New Game** on the title screen.
