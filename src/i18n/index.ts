/*
 * Tiny UI-string localization. The interface follows the selected UI language;
 * any key missing in that language falls back to English (en.json is the full
 * key set), and an unknown key resolves to itself as a last resort.
 */
import en from './en.json'
import ar from './ar.json'
import de from './de.json'
import sv from './sv.json'

export type MsgKey = keyof typeof en
// accepts any string so the shared presentational components stay decoupled
export type Translate = (key: string) => string

// the interface languages offered in the UI-language dropdown, under their own
// native names (the same set the JSON files above cover)
export const UI_LANGUAGES: { code: string, display: string }[] = [
	{ code: 'en', display: 'English' },
	{ code: 'ar', display: 'عربي' },
	{ code: 'de', display: 'Deutsch' },
	{ code: 'sv', display: 'Svenska' },
]

const DICTS: Record<string, Partial<Record<string, string>>> = { en, ar, de, sv }

// a translate function for the given language, falling back to English
export function translator(lang: string): Translate {
	const dict = DICTS[lang] ?? {}
	const base: Partial<Record<string, string>> = en
	return (key) => dict[key] ?? base[key] ?? key
}

// a content language's name in the current UI language — e.g. code "ar" →
// "Arabic" (English UI) / "Arabisch" (German UI) — falling back to the given
// native name (e.g. عربي) when that pair isn't translated
export function languageName(t: Translate, code: string, fallback: string): string {
	const key = `language.${code}`
	const s = t(key)
	return s === key ? fallback : s
}
