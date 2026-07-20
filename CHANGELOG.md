# Arqaam Changelog

<!-- https://keepachangelog.com/en/1.0.0/ -->

## [0.15.0] 2026-07-20
### Changed
- Internal refactor (no behaviour change): App.tsx is split into focused
  modules shared verbatim with the sister projects — `useAudio` (playback,
  mute, feedback sounds), `useGame` (the round state machine), `GameHud` (the
  score and action segments) and `useFitText` (the display shrink-to-fit) —
  cutting App.tsx from ~545 to ~290 lines

## [0.15.0] 2026-07-18
### Fixed
- Pressed and selected controls are now clearly visible in dark mode: a new
  shared `--active-bg` accent (the steel blue Flags already used) backs the
  game and mute toggles, the open settings gear, selected segments and the
  flight-mode toggle. They previously used `--surface-hover`, which in dark
  mode is nearly identical to the normal button background
### Added
- Add a mute toggle (🔊/🔇) in the toolbar, right of the game button: while
  muted nothing plays — names, game prompts or feedback sounds — and whatever
  is playing at that moment stops
- During a round, the prompted number's name is written in the display
  segment (muted or not), so the game can also be played by reading
- Add a replay button (👂) to the game actions: plays the current prompt
  again; disabled while muted or between rounds
- On first visit, pick the starting language from the browser
  (navigator.language) and show only the browser's languages
  (navigator.languages), like the sister projects; everything else starts
  hidden (all languages can still be enabled in settings)
- Show a play icon (▶) on the number button while its sound is playing, keep
  the button pressed down, and stop the sound when the playing number is
  clicked again, like the sister projects. Game prompts don't show the icon
  (it would reveal the answer)
- Add a feature flag (`beta`) to hide unfinished languages from production
  builds while keeping them visible in development, like the sister projects
### Changed
- Change the game toggle emoji from 🎮 to 🕹️ (the classic joystick)
- Restructure the top of the app into one sticky app bar with four segments,
  right-to-left: toolbar (🕹️ game, 🔊 mute, language, ⚙️ settings), display
  (the spoken name), live game score (🏁 played 👎 mistakes 🤷‍♂️ give-ups
  ⏱️ time, ticking every second) and game actions. The game segments anchor
  to the left, the toolbar to the right, and the display stretches between
  them — a long name first shrinks its font (down to a limit) and only then
  auto-scrolls back and forth. The game segments only appear in game mode,
  unfolding with a smooth transition; on narrow screens the bar stacks the
  segments top-to-bottom in the same order, with the display on a full row
- The game no longer ends by itself: when every number has been played the
  round is over — the clock freezes and the score stays — but game mode
  stays on. New round actions sit next to the give-up button (🤷‍♂️): stop
  (✋) ends the current round early and restart (🔄) starts a fresh one;
  clicking 🕹️ again leaves game mode and hides the game score and actions
- In the game result, show the mistakes count with 👎 instead of ❌, matching
  the marker shown on a wrong guess
- Replace the generated favicon set (ico + five pngs) with a single hand-drawn
  `favicon.svg` (a 1-2-3-4 keypad tile in the old icon's colors), like the
  sister projects Colors and Week; the manifest now uses the svg, matches the
  app's dark background (#121212), and the home-screen short name is "Arqaam"
  (was "1234")
- Move the sound files from `public/sounds/<lang>/` to
  `public/sound/lang/<lang>/` (and the feedback sounds to `public/sound/fx/`),
  the same layout as the sister projects. Already-cached sounds under the old
  URLs are simply re-downloaded once; the old cache entries stay unused until
  cleared with 🗑️
### Removed
- Leftover Create React App / favicon-generator files: `public/about.txt`,
  `public/site.webmanifest` (duplicate of `manifest.json`), the empty
  `public/favicon_io` folder, and the outdated `img.png` screenshot in the
  README (the favicon's Twemoji CC-BY 4.0 attribution moved to the README
  Credits section)

## [0.14.0] 2026-07-18
### Added
- Add a settings panel (⚙️ top right) like the sister projects, with a Theme
  option (system / light / dark icons, system is the default); the choice is
  saved in localStorage and applied before first paint to avoid a flash
- Add a language show/hide checklist to the settings panel (with ✅/⬜
  select-all/deselect-all buttons), like the sister projects; hiding the
  selected language falls back to the first visible one, and with every
  language hidden a number click shows 🤷‍♂️ instead of playing a sound
- Support a URL parameter for a shareable view: `l` sets which languages are
  shown with the first one selected (e.g. `?l=en,ar`), like the sister projects
- Add an About section at the bottom of the settings panel showing the app
  version and a link to the developer's GitHub, like the sister projects
- Add a flight mode toggle (✈️) in settings, like the sister projects: downloads
  all visible sounds, caches newly shown languages right away while on, and
  keeps the cached files when turned off. Next to it, the number of cached
  sound files (🔊) and a clear sound cache button (🗑️) that only works outside
  flight mode
- Add a guessing game (🎮 in the top bar), like the sister projects: a random
  number is spoken in the selected language and you tap the matching button.
  A correct tap flashes 👍 with a chime and disables that number; a wrong tap
  flashes 👎 with a buzz and temporarily disables it (with a 👎 marker) until
  the round is won. The give-up button (🤷‍♂️) reveals the current number,
  marks it 🤷‍♂️ and plays a give-up sound (counted as played, tracked
  separately from mistakes). The numbers stay in order (not shuffled). The
  game ends when every number has been played, or when you press 🎮 again;
  either way it shows played / mistakes / give-ups / time. The language is
  locked during a game; theme and flight mode stay changeable. Prompt sounds
  are pre-loaded before the game starts so gameplay never waits on the network,
  and answering the last number early no longer leaves a pending prompt playing
  (the next-prompt timer is cancelled)
### Changed
- Cache all sounds in a single store (IndexedDB) instead of the previous
  Cache Storage pair (files + timestamps). Simpler, works in Safari Lockdown
  Mode, and drops the 7-day TTL (the cache lives until cleared with the 🗑️
  button)
- Replace the row of flag buttons with a language dropdown in the top bar,
  like the sister projects
- Show each language under its native name (عربي, Deutsch, Svenska, Français,
  Türkçe, فارسی, Русский, Suomi, Español) instead of flag emojis and English
  names, like the sister projects
- Migrate the build from Create React App (react-scripts) to Vite, and switch the
  package manager from yarn to npm, to align with the sister projects
  [Flags](https://github.com/amerharb/flags),
  [Colors](https://github.com/amerharb/colors) and
  [Week](https://github.com/amerharb/week)
- Upgrade to React 19 and TypeScript 6 (and bump the other dependencies to match
  the sister projects); the version is bumped to 0.14.0 to align with them
### Fixed
- Number buttons no longer overflow their borders on narrow screens: the
  button width and digit size now scale together with the viewport, instead
  of a fixed 40px font inside a 7%-wide button
- Vercel deploys again: a new `vercel.json` sets the framework to Vite and the
  output directory to `dist` (the Vercel project was still configured for
  Create React App's `build` folder)
### Removed
- The page title and its double-click download of all sound files; the flight
  mode toggle (✈️, above) is its replacement
- The Create React App test setup (`react-scripts` test tooling and the
  `@testing-library/*` dev dependencies)

## [0.10.0] 2024-02-25
### Added
- Add Spanish numbers
### Changed
- Enhance async call by using promise.all 

## [0.9.0] 2024-02-25
### Added
- Add Persian numbers
- Cache sound files for 1 week instead of 1 day
- Cache sound files when double click page title

## [0.8.0] 2025-01-01
### Added
- Add French numbers
- Show number spelling
- Extend cache sound files from 4 hours to 24 hours
### Fixed
- Dont cache empty sound files

## [0.7.0] 2024-08-02
### Added
- Add Russian numbers

## [0.6.0] 2024-06-02
### Added
- Add Turkish numbers

## [0.5.0] 2024-05-12
### Added
- Add Finnish numbers
