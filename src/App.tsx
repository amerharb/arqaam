import './App.css'
import React, { useCallback, useEffect, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import SettingsPanel from './SettingsPanel'
import { Settings, DEFAULT_SETTINGS, loadSettings, saveSettings, applyTheme } from './settingsStore'
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

	async function getAudio(audioUrl: string) {
		const TTL = 1000 * 60 * 60 * 24 * 7 // 7 days
		if ('caches' in window) {
			const audioCache = await caches.open('audio-cache')
			const audioCacheTimestamps = await caches.open('audio-cache-timestamps')
			const cachedResponse = await audioCache.match(audioUrl)

			if (cachedResponse) {
				const timestampResponse = await audioCacheTimestamps.match(audioUrl)
				if (timestampResponse) {
					const timestamp = await timestampResponse.text()
					const cachedTime = Number(timestamp)
					const currentTime = Date.now()

					if (currentTime - cachedTime > TTL) {
						await Promise.all([
							await audioCache.delete(audioUrl),
							await audioCacheTimestamps.delete(audioUrl),
						])
					} else {
						return cachedResponse
					}
				}
			}

			const response = await fetch(audioUrl)
			// skip caching if response empty
			if (!response.headers.get('Content-Length') || response.headers.get('Content-Length') === '0') {
				return response
			}

			await audioCache.put(audioUrl, response.clone())
			const timestampResponse = new Response(Date.now().toString())
			await audioCacheTimestamps.put(audioUrl, timestampResponse)

			return response
		} else {
			return await fetch(audioUrl)
		}
	}

	const playSound = useCallback(async (langCode: string, n?: number) => {
		try {
			const audioUrl = `/sounds/${langCode}/${n ?? langCode}.aac`
			const response = await getAudio(audioUrl)
			const blob = await response.blob()
			const objectUrl = URL.createObjectURL(blob)
			const audio = new Audio(objectUrl)
			await audio.play()
		} catch (e) {
			console.error(e)
		}
	}, [])

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
					onChange={updateSettings}
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
