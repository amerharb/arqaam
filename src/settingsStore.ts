/*
 * User settings, persisted in localStorage (not cookies: this is a front-end
 * only app, so there's no server that needs them, and localStorage avoids
 * sending the data on every request). Stored as one JSON blob under STORAGE_KEY
 * so new settings can be added over time without new storage keys.
 */
export type Theme = 'system' | 'light' | 'dark'

export type Settings = {
	theme: Theme,
	// language codes the user chose to hide from the main screen; empty = show
	// everything, so newly added languages are visible by default
	hiddenLanguages: string[],
	// when on, all visible sounds are downloaded to the cache, and newly shown
	// languages are cached as soon as they are enabled
	flightMode: boolean,
}

export const DEFAULT_SETTINGS: Settings = {
	theme: 'system',
	hiddenLanguages: [],
	flightMode: false,
}

const STORAGE_KEY = 'arqaam:settings'

// all supported languages that a browser locale can match
const SPOKEN_LANGUAGES = ['ar', 'en', 'de', 'sv', 'fr', 'tr', 'fa', 'ru', 'fi', 'es']

// map a BCP-47 tag (e.g. "en-US", "sv") to one of our language codes, or null
function tagToLanguage(tag: string): string | null {
	const primary = tag.toLowerCase().split('-')[0]
	return SPOKEN_LANGUAGES.includes(primary) ? primary : null
}

// the browser's preferred language, mapped to a supported code (falls back to English)
export function preferredLanguage(): string {
	const tag = (typeof navigator !== 'undefined' && navigator.language) || ''
	return tagToLanguage(tag) ?? 'en'
}

// first-run settings: show only the browser's languages (navigator.languages) plus
// the preferred one; everything else starts hidden
function firstRunSettings(): Settings {
	const tags = (typeof navigator !== 'undefined' && navigator.languages) || []
	const visible = new Set<string>(tags.map(tagToLanguage).filter(Boolean) as string[])
	visible.add(preferredLanguage())
	const hiddenLanguages = SPOKEN_LANGUAGES.filter(code => !visible.has(code))
	return { ...DEFAULT_SETTINGS, hiddenLanguages }
}

export function loadSettings(): Settings {
	try {
		const raw = localStorage.getItem(STORAGE_KEY)
		if (raw) {
			return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
		}
	} catch {
		// localStorage may be unavailable (e.g. private mode); fall back to defaults
	}
	// no saved settings: derive first-run visibility from the browser's languages
	return firstRunSettings()
}

export function saveSettings(settings: Settings): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
	} catch {
		// ignore: settings still apply for the current session
	}
}

// Drive the CSS `color-scheme` via the data-theme attribute on <html>.
export function applyTheme(theme: Theme): void {
	const root = document.documentElement
	if (theme === 'system') {
		root.removeAttribute('data-theme')
	} else {
		root.setAttribute('data-theme', theme)
	}
}
