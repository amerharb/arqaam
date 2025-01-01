import './App.css'
import React, { useCallback, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import { Lang } from './lang/Lang'
import { ar } from './lang/ar'
import { de } from './lang/de'
import { en } from './lang/en'
import { fi } from './lang/fi'
import { fr } from './lang/fr'
import { ru } from './lang/ru'
import { sv } from './lang/sv'
import { tr } from './lang/tr'

function App() {
	const langList: Lang[] = [ar, en, de, sv, fr, tr, ru, fi]
	// TODO: Add more languages later
	// {code: 'fa', display: 'Farsi', flag: '🇮🇷'},
	// {code: 'zh', display: 'Chinese', flag: '🇨🇳'},
	// {code: 'es', display: 'Spanish', flag: '🇪🇸'},
	const [lang, setSelectedLanguage] = useState(langList[0])
	const [spelledNumber, setSpelledNumber] = useState('')

	const handleLanguageChange = async (lang: Lang) => {
		await playSound(lang.code)
		setSelectedLanguage(lang)
	}

	async function getAudio(audioUrl: string) {
		const ttl = 1000 * 60 * 60 * 24 // 24 hour
		if ('caches' in window) {
			const cache = await caches.open('audio-cache')
			const timestampCache = await caches.open('audio-cache-timestamps')
			const cachedResponse = await cache.match(audioUrl)

			if (cachedResponse) {
				const timestampResponse = await timestampCache.match(audioUrl)
				if (timestampResponse) {
					const timestamp = await timestampResponse.text()
					const cachedTime = Number(timestamp)
					const currentTime = Date.now()

					if (currentTime - cachedTime > ttl) {
						await cache.delete(audioUrl)
						await timestampCache.delete(audioUrl)
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

			await cache.put(audioUrl, response.clone())
			const timestampResponse = new Response(Date.now().toString())
			await timestampCache.put(audioUrl, timestampResponse)

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
			<h1>Arqaam Web</h1>
			<hgroup>
				{langList.map((l) => (
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
				{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
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
