# Kid Number Adventure

A colorful number-learning game for ages 2–6 (numbers 1–10), built as a
Next.js web app with a Phaser 3 game embedded on `/play`, wrapped in
Capacitor for Android. See the original design doc for full scope — this
README tracks what's actually built.

## Status

**MVP scene set is playable end-to-end with zero art assets** — every
visual (balloons, dino, apples, number tiles) is drawn with Phaser
Graphics/Text/emoji, so there's nothing to download or license to try it.

Built so far:
- Home menu (`/`) — Play, Daily Reward (routes into `/play`, reward logic TODO), Achievements, Settings, Parents
- `/play` — mounts the Phaser game (World Map → 4 MVP mini-games → Reward screen → back to World Map)
- Mini-games: **Balloon Pop**, **Feed Dino**, **Count Animals**, **Number Match** — all 5 rounds/level, coins on completion, gentle (non-punishing) wrong-answer feedback
- Local-storage progress save (`game/progress.ts`) — coins, stars, completed levels, no login, shared between React pages and Phaser scenes
- Achievements page reads real unlock conditions against saved progress
- Parent dashboard shows real stats (levels completed, coins) pulled from local storage

Not yet built (see doc for full list — these are the next logical steps):
- Daily Reward's actual 7-day cycle logic (button currently just opens `/play`)
- Interstitial ads / AdMob wiring (`@capacitor-community/admob` — deliberately last, see "Ads" below)
- Sound effects / music (Settings toggles exist but aren't wired to anything yet)
- Remaining mini-games from the doc (Memory Cards, Fishing, Train, Shape Count, Trace Number) — later-update scope, not MVP
- Difficulty ramp beyond "more decoys per round"
- Character unlocks / World 2+

## Running it

```bash
npm install
npm run dev
```

Open `http://localhost:3000`, tap PLAY. Everything works in a normal
browser — no Android/Capacitor step needed for day-to-day development.

## Building the Android APK (Capacitor)

```bash
npm run build        # next build --output export -> ./out
npx cap add android   # first time only — generates /android (gitignored)
npx cap sync android
npx cap open android  # opens Android Studio
```

You'll need Android Studio installed to actually build/sign the APK; that
part can't happen from a phone browser. Once `/android` exists, `npx cap
sync android` after each `npm run build` is enough to push new web code
into it.

## Zero-budget asset plan

Everything in the stack (Next.js, Phaser 3, TypeScript, Capacitor) is free
and open source — no licenses to buy. For the art/sound the placeholder
Graphics/emoji visuals are eventually meant to be replaced with:

- **Kenney.nl** — CC0 (public domain), no attribution required. Good starting packs for this game's needs:
  - [Animal Pack Redux](https://kenney.nl/assets/animal-pack-redux) — 10 animals in 8 styles, for Count Animals / Feed Dino
  - [Background Elements Remastered](https://kenney.nl/assets/background-elements-remastered) — clouds, hills, simple scenery for world backgrounds
  - [Mini Characters](https://kenney.nl/assets/mini-characters) — simple rounded character bases, could reskin one as Dino
  - Kenney also has a `Fish Pack` and `Foliage Pack` useful for the Ocean/Grassland worlds later
- **OpenGameArt.org** — large mirror of more CC0/CC-BY Kenney and community packs if a specific theme (space, candy) isn't in Kenney's own catalog
- **Freesound.org** — CC-licensed sound effects (pops, chimes, laughs) for tap/success/fail feedback
- Character/world art beyond what's on those sites can stay as the current
  Graphics/emoji placeholders indefinitely — kids this age respond well to
  bold flat shapes, so it's a legitimate style choice, not just a stopgap.

The **only unavoidable real cost** is Google Play Console's one-time **$25
developer registration fee**, only needed at the point of actually
publishing to the Play Store — not before.

## Ads

The doc calls for Banner/Interstitial/Rewarded AdMob ads. That's real
money-in for a free app, but do it **last**, once the game itself is fun —
an ad plugin wired into an empty shell doesn't help retention. When ready:
`@capacitor-community/admob`, native-only (won't work in plain web/`next
dev`).

## Project structure

```
app/            Next.js pages (menu, settings, achievements, parent, /play host)
components/     Shared React UI (Button, DinoMascot, CoinCounter, BannerAd)
game/           Phaser side
  config.ts       Game config + scene list
  progress.ts     localStorage save/load (shared with React pages)
  theme.ts        Color palette (same tokens as app/globals.css)
  scenes/
    BootScene.ts       Entry point (no assets to preload yet)
    WorldMapScene.ts   Mini-game picker (World 1 / Grassland, MVP games only)
    BalloonPopScene.ts
    FeedDinoScene.ts
    CountAnimalsScene.ts
    NumberMatchScene.ts
    RewardScene.ts     Shared "level complete" screen
    helpers.ts         Number tiles, confetti, coin-fly, HUD chrome
```
