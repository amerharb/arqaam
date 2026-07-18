/*
 * Feature flags for gating unfinished content out of production.
 *
 * Mark a language (in its language file) with `beta: true` to keep it visible
 * while developing but hidden from the deployed production build — handy for
 * adding a language whose sounds or number words aren't ready yet.
 *
 * Beta items are shown when:
 *   - running the dev server (`npm start`), or
 *   - the build was made with VITE_SHOW_BETA=true (e.g. a preview deploy).
 * Otherwise (a normal production build) they are filtered out.
 */
export const SHOW_BETA: boolean =
	import.meta.env.DEV || import.meta.env.VITE_SHOW_BETA === 'true'

export type Flaggable = { beta?: boolean }

// True if the item should be visible in the current build.
export function isVisible<T extends Flaggable>(item: T): boolean {
	return !item.beta || SHOW_BETA
}
