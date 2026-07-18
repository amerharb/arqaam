[![Version](https://img.shields.io/badge/version-0.15.0-blue.svg)](https://github.com/amerharb/arqaam/tree/version/0.15.0)
# Arqaam

Small react project to pronounce numbers from zero to ten in several languages.
Sister project of [Flags](https://github.com/amerharb/flags),
[Colors](https://github.com/amerharb/colors) and
[Week](https://github.com/amerharb/week).

## Languages supported
- Arabic
- English
- German
- Swedish
- French
- Turkish
- Persian
- Russian
- Finnish
- Spanish
- We are looking for more languages, see How to contribute

## How it works
Pick a language from the dropdown in the top right, then click a number (0–10)
to hear it pronounced and see it spelled out in that language. Click the number
again (▶ while it plays) to stop.

- Settings (⚙️ top right): theme (system / light / dark, system is the default),
  a language checklist to show/hide languages (with ✅/⬜
  select-all/deselect-all buttons), a flight mode toggle (✈️), and cache info
  (🔊 count and a 🗑️ clear button). Saved in localStorage and remembered
  between visits.
- Flight mode (✈️): downloads all visible sounds into the browser's cache
  (IndexedDB) so they play offline; anything newly shown while it is on is
  downloaded right away. Turning it off keeps the cached files (🗑️ clears them).
- Game (🎮 in the top bar): start a guessing game — a random number is spoken in
  the selected language and you tap the matching button (👍 correct, 👎 wrong).
  The numbers stay in order (they are not shuffled). A wrong number is
  temporarily disabled with a 👎 marker until you find the correct one. Stuck?
  The give-up button (🤷‍♂️) reveals it and plays a give-up sound (tracked
  separately from mistakes). It runs through all eleven numbers, then shows how
  many you played, your mistakes, give-ups, and your time; press 🎮 again to
  stop early. Theme and flight mode stay changeable mid-game; the language is
  locked. Needs at least one language visible. Prompt sounds are pre-loaded so
  gameplay never waits on the network.
- First visit: the starting language and which languages are shown come from your
  browser's language settings.

## URL parameters
For a shareable/deep-linked view:
- `l` — which languages are shown, with the first one selected, e.g. `?l=en,ar`.

List order does not affect the on-screen order.

## How to contribute
### Media files
All that is needed to support a new language is 12 sound files in AAC format: one
for the name of the language and eleven for the numbers from 0 to 10. Audio files
live under `public/sounds/<lang>/<n>.aac` (for example `public/sounds/en/7.aac`
for "seven" in English, and `public/sounds/en/en.aac` for the language name).
#### What is needed
- Creative Commons sound files to replace some of the current lower-quality ones
- New sound files for a new language to be supported

### Coding
Arqaam is an open source project built on Vite, React 19, TypeScript v6.x and npm.
All the code is Frontend, no backend needed.

To add a language:
1. Create `src/lang/<code>.ts` exporting a `Lang` (`code`, `display` — the
   language's name in its own native script — and `numbers`) with the number
   words 0–10.
2. Import it and add it to the `LANGUAGES` array in `src/App.tsx`.
3. Drop the audio files at `public/sounds/<code>/`.

#### Setup environment
- Node 20.19 or above
- npm 9.x or above
- Install `npm install`
- Build: `npm run build` (output in `dist/`)
- Start dev server: `npm start`
- Preview production build: `npm run preview`

### What is needed
- Add Chinese 🇨🇳 and more languages
- CSS styling so the website aligns nicely on all platforms
- Better quality sound files

### Deploying
Once a PR is merged to the main branch it is automatically deployed using the
Vercel integration with GitHub.

## Credits
### For sound
- Arabic: [https://ttsfree.com/text-to-speech/arabic]()
- English: [https://archive.org/details/numbers0-100englishpronouciation/]()
- German: [Wiktionary DE](https://de.wiktionary.org/)
- Swedish: [Wikimedia Commons](https://commons.wikimedia.org/)
- French: [Wiktionary FR](https://fr.wiktionary.org/)
- Turkish: [www.ttsfree.com](https://ttsfree.com/text-to-speech/turkish-turkey)
- Persian: [www.narakeet.com](https://www.narakeet.com/app/text-to-audio)
- Finnish: [www.ttsfree.com](https://ttsfree.com/text-to-speech/finnish-finland#google_vignette)
- Russian: [Wiktionary RU](https://ru.wiktionary.org/)
- Spanish: [https://ttsfree.com/text-to-speech/spanish-spain]()

### For graphics
The favicon was generated with [favicon.io](https://favicon.io/) from the
[Twitter Twemoji](https://github.com/twitter/twemoji) `1f522` (🔢) graphic,
Copyright 2020 Twitter, Inc and other contributors, licensed under
[CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/).
