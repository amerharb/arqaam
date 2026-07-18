import './App.css'
import React, { useCallback, useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import SettingsPanel from './SettingsPanel'
import { Settings, DEFAULT_SETTINGS, loadSettings, saveSettings, applyTheme } from './settingsStore'
import { getAudioBlob, ensureCached, idbCount, idbClear } from './audioCache'
import { Lang } from './lang/Lang'
import { ar } from './lang/ar'
import { de } from './lang/de'
import { en } from './lang/en'
import { fa } from './lang/fa'
import { fi } from './lang/fi'
import { fr } from './lang/fr'
import { ru } from './lang/ru'
import { sv } from './lang/sv'
import { tr } from './lang/tr'
import { es } from './lang/es'

function App() {
	// everything the build supports
	const ALL_LANGUAGES: Lang[] = [ar, en, de, sv, fr, tr, fa, ru, fi, es]
	const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
	// code of the selected language (the spoken and spelled number words)
	const [selectedCode, setSelectedCode] = useState(ALL_LANGUAGES[0].code)
	const [spelledNumber, setSpelledNumber] = useState('')
	// true while flight-mode downloads are in progress, to show it on the toggle
	const [caching, setCaching] = useState(false)
	// how many sound files are currently in the cache, shown in settings
	const [cachedCount, setCachedCount] = useState(0)

	const refreshCacheCount = useCallback(async () => {
		try {
			setCachedCount(await idbCount())
		} catch {
			// leave the previous count
		}
	}, [])
	useEffect(() => {
		refreshCacheCount()
	}, [refreshCacheCount])

	// delete only the downloaded sound files (settings stay); not allowed in flight mode
	const clearSoundCache = useCallback(async () => {
		try {
			await idbClear()
		} catch {
			// ignore
		}
		setCachedCount(0)
	}, [])

	// Flight mode: download the given sounds into the cache, showing the busy state.
	const cacheAudioUrls = useCallback(async (audioUrls: string[]) => {
		setCaching(true)
		try {
			await ensureCached(audioUrls)
		} finally {
			setCaching(false)
			refreshCacheCount()
		}
	}, [refreshCacheCount])

	// user settings (theme + which languages to show)
	const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
	useEffect(() => {
		let loaded = loadSettings()

		// URL param for a shareable/deep-linked view:
		//   ?l=en,ar   -> only these languages are visible; the first is selected
		// Order in the param does not affect the on-screen order.
		const params = new URLSearchParams(window.location.search)
		const lParam = params.get('l')
		if (lParam !== null) {
			const valid = new Set(ALL_LANGUAGES.map(l => l.code))
			const want = lParam.split(',').map(s => s.trim()).filter(c => valid.has(c))
			const hiddenLanguages = ALL_LANGUAGES.map(l => l.code).filter(c => !want.includes(c))
			loaded = { ...loaded, hiddenLanguages }
			if (want.length > 0) setSelectedCode(want[0]) // first listed = selected
		}

		setSettings(loaded)
		applyTheme(loaded.theme)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const updateSettings = (next: Settings) => {
		// flight mode: download what is (or becomes) visible. Each language needs
		// the digits 0–10 plus its language-name sound.
		const visibleLangs = ALL_LANGUAGES.filter(l => !next.hiddenLanguages.includes(l.code))
		const urlsFor = (langs: typeof visibleLangs) =>
			langs.flatMap(l => [
				...DIGITS.map(n => `/sounds/${l.code}/${n}.aac`),
				`/sounds/${l.code}/${l.code}.aac`,
			])
		if (next.flightMode && !settings.flightMode) {
			// just switched on: cache everything currently visible
			cacheAudioUrls(urlsFor(visibleLangs))
		} else if (next.flightMode) {
			// already on: cache only the languages that just became visible
			const newLangs = visibleLangs.filter(l => settings.hiddenLanguages.includes(l.code))
			if (newLangs.length > 0) {
				cacheAudioUrls(urlsFor(newLangs))
			}
		}

		setSettings(next)
		saveSettings(next)
		applyTheme(next.theme)
	}

	const LANGUAGES = ALL_LANGUAGES.filter(l => !settings.hiddenLanguages.includes(l.code))
	// the selected language object; undefined when every language is hidden
	const lang = LANGUAGES.find(l => l.code === selectedCode)

	// if the selected language gets hidden in settings, fall back to the first visible one
	useEffect(() => {
		if (LANGUAGES.length > 0 && !LANGUAGES.some(l => l.code === selectedCode)) {
			setSelectedCode(LANGUAGES[0].code)
			setSpelledNumber('')
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [settings.hiddenLanguages])

	const handleLanguageChange = async (code: string) => {
		await playSound(code)
		setSelectedCode(code)
		setSpelledNumber('')
	}

	// Play a sound from the cache (IndexedDB, works in Safari Lockdown Mode) or
	// the network, storing it for next time.
	const playSound = useCallback(async (langCode: string, n?: number) => {
		try {
			const audioUrl = `/sounds/${langCode}/${n ?? langCode}.aac`
			const blob = await getAudioBlob(audioUrl)
			if (!blob) return
			const objectUrl = URL.createObjectURL(blob)
			const audio = new Audio(objectUrl)
			audio.onended = () => URL.revokeObjectURL(objectUrl)
			await audio.play()
			refreshCacheCount() // playing may have added the file to the cache
		} catch (e) {
			console.error(e)
		}
	}, [refreshCacheCount])

	return (
		<div className="Arqaam">
			<div className="top-controls">
				<select
					className="language-select"
					title="Language of the numbers"
					value={lang ? lang.code : ''}
					onChange={(e) => handleLanguageChange(e.target.value)}
				>
					{LANGUAGES.map(l => (
						<option key={`lang-${l.code}`} value={l.code}>{l.display}</option>
					))}
				</select>
				<SettingsPanel
					settings={settings}
					languages={ALL_LANGUAGES}
					caching={caching}
					cachedCount={cachedCount}
					onChange={updateSettings}
					onClearCache={clearSoundCache}
				/>
			</div>
			<hgroup>
				{DIGITS.map(n => (
					<button
						key={`number-${n}`}
						className="button-number"
						title={lang ? lang.numbers[n] : '🤷‍♂️'}
						onClick={() => {
							if (!lang) {
								// every language is hidden: nothing to say
								setSpelledNumber('🤷‍♂️')
								return
							}
							playSound(lang.code, n)
							setSpelledNumber(lang.numbers[n])
						}}
					>
						{n}
					</button>
				))}
			</hgroup>
			<hgroup>
				<h1>
					{spelledNumber}
				</h1>
			</hgroup>
			<Analytics/>
		</div>
	)
}

export default App
