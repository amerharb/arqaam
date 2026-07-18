# Arqaam Changelog

<!-- https://keepachangelog.com/en/1.0.0/ -->

## [0.14.0] 2026-07-18
### Changed
- Migrate the build from Create React App (react-scripts) to Vite, and switch the
  package manager from yarn to npm, to align with the sister projects
  [Flags](https://github.com/amerharb/flags),
  [Colors](https://github.com/amerharb/colors) and
  [Week](https://github.com/amerharb/week)
- Upgrade to React 19 and TypeScript 6 (and bump the other dependencies to match
  the sister projects); the version is bumped to 0.14.0 to align with them
### Removed
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
