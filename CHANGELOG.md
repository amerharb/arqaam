# Arqaam Changelog

<!-- https://keepachangelog.com/en/1.0.0/ -->

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
- Add a flight mode toggle (✈️) in settings, like the sister projects: downloads
  all visible sounds, caches newly shown languages right away while on, and
  keeps the cached files when turned off. Next to it, the number of cached
  sound files (🔊) and a clear sound cache button (🗑️) that only works outside
  flight mode
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
### Removed
- The page title and its double-click download of all sound files; an
  alternative (like the sister projects' flight mode) will come later
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
