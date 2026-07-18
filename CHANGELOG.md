# Arqaam Changelog

<!-- https://keepachangelog.com/en/1.0.0/ -->

## [0.15.0] 2026-07-18

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
