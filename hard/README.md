# Love Run: HARD 😈

The hard version of Super Love Run. **You** are the player (brown bear with your face), and **Chan** waits for you at the castle (white panda with her bow and purse). The fireworks at the end spell **I ♥ CHAN**.

Play it at: **https://arman12112001.github.io/Swing_bot/hard/**

The original game in `docs/` is not changed. This one has its own saved progress, best score and offline copy, so the two never mix.

## What makes it hard

- **3 hearts for the whole game.** They are not refilled between levels. One 1-UP per level, plus 100 coins = +1.
- **No refills after dying:** coins you took and blocks you used stay used. Only **one checkpoint** per level.
- **Faster enemies** (about 40% faster) and more of them, including fast walkers in place of slow ones in levels 2 and 3.
- **Wider pits**, longer spike rows, faster moving platforms.
- **More danger:** two spiky-ball clouds per level that throw faster, cannons firing every ~2 seconds, more fish, faster fire bars, lava bubbles that jump more often.
- **Short power-ups:** cake 8 s, pizza 15 s, broccoli 15 s, heart shield 6 s.
- **Shorter timer:** 300 / 330 / 360 seconds.
- **The dragon** has 10 health (5 stomps), walks and jumps faster, breathes faster flames, and every other breath is three flames. Fire still only takes her to 10%; the last hit must be a stomp.

All of these are at the top of `index.html` (`START_LIVES`, `CAKE_SECONDS`, `DRAGON_HP`, …) and in the constants just below it (`ENEMY_SPEED`, platform speeds). The levels are in `const LEVELS` the same way as in the original game.

## Updating

Change files here, then raise `GAME_VERSION` in `index.html` and the number in `CACHE = 'love-run-hard-v…'` in `sw.js` (both are 1 now).
