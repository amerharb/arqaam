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

const DICTS: Record<string, Partial<Record<string, string>>> = { en, ar, de, sv }

// a translate function for the given language, falling back to English
export function translator(lang: string): Translate {
	const dict = DICTS[lang] ?? {}
	const base: Partial<Record<string, string>> = en
	return (key) => dict[key] ?? base[key] ?? key
}
