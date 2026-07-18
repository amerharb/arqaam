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
	const LANGUAGES: Lang[] = [ar, en, de, sv, fr, tr, fa, ru, fi, es]
	const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
	const [lang, setSelectedLanguage] = useState(LANGUAGES[0])
	const [spelledNumber, setSpelledNumber] = useState('')

	// user settings (theme only for now)
	const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
	useEffect(() => {
		const loaded = loadSettings()
		setSettings(loaded)
		applyTheme(loaded.theme)
	}, [])

	const updateSettings = (next: Settings) => {
		setSettings(next)
		saveSettings(next)
		applyTheme(next.theme)
	}

	const handleLanguageChange = async (lang: Lang) => {
		await playSound(lang.code)
		setSelectedLanguage(lang)
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
				<SettingsPanel
					settings={settings}
					onChange={updateSettings}
				/>
			</div>
			<hgroup>
				{LANGUAGES.map((l) => (
					<button
						key={`lang-${l.code}`}
						className={l.code === lang.code ? 'down' : 'up'}
						onClick={() => handleLanguageChange(l)}
					>
						{l.flag}
					</button>
				))}
			</hgroup>
			<hgroup>
				{DIGITS.map(n => (
					<button
						key={`number-${n}`}
						className="button-number"
						title={lang.numbers ? lang.numbers[n] : ''}
						onClick={() => {
							playSound(lang.code, n)
							setSpelledNumber(lang.numbers ? lang.numbers[n] : '')
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
