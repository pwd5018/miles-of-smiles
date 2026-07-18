# Miles of Smiles

A mobile-first family road-trip game host with 20 interactive activities,
including scavenger hunts, pass-and-play prompts, voting games, timed
challenges, rapid-fire rounds, favorites, a local scoreboard, sound/haptic
feedback, and offline support.

## Game modes

- Tap & find: check off roadside items, letters, colors, or plates.
- Pass & vote: let each passenger vote privately, then reveal the split.
- Pass & play: advance the turn tracker as the phone moves around the car.
- Beat the clock: start a mobile-friendly countdown for quiet, music, comedy,
  and observation challenges.
- Quick fire: tap a counter as the car names valid answers.

Everything works without an account. Favorites, player names, scores, sound
preference, and completed rounds are stored locally in the browser. The service
worker caches the app shell so the game can keep working after the initial load.

## Deploy to Vercel

1. Extract this ZIP.
2. Go to https://vercel.com/drop.
3. Drag the extracted `miles-of-smiles` folder onto the page.
4. Choose a project name and click **Deploy**.

## Run locally

Install Node.js, then run:

```bash
npm install
npm run dev
```
