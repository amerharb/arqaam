import './App.css'
import React, { useCallback, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
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

function App() {
	const LANGUAGES: Lang[] = [ar, en, de, sv, fr, tr, fa, ru, fi]
	const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
	// TODO: Add more languages later
	// {code: 'zh', display: 'Chinese', flag: '🇨🇳'},
	// {code: 'es', display: 'Spanish', flag: '🇪🇸'},
	const [lang, setSelectedLanguage] = useState(LANGUAGES[0])
	const [spelledNumber, setSpelledNumber] = useState('')

	const handleLanguageChange = async (lang: Lang) => {
		await playSound(lang.code)
		setSelectedLanguage(lang)
		setSpelledNumber('')
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

	async function cacheAllAudioFiles() {
		console.time('cacheAllAudioFiles')
		try {
			const audioUrls = LANGUAGES.flatMap(lang => DIGITS.map(n => `/sounds/${lang.code}/${n}.aac`))

			await caches.delete('audio-cache')
			await caches.delete('audio-cache-timestamps')
			const cache = await caches.open('audio-cache')
			const timestampCache = await caches.open('audio-cache-timestamps')

			await Promise.all(
				audioUrls.map(async url => {
					try {
						const res = await fetch(url)
						if (res.ok && res.body) {
							await cache.put(url, res.clone())
							const timestampResponse = new Response(Date.now().toString())
							await timestampCache.put(url, timestampResponse)
						} else {
							console.warn(`Failed to cache: ${url} (status: ${res.status})`)
						}
					} catch (err) {
						console.error(`Error fetching ${url}:`, err)
					}
				}),
			)

			console.log('Audio files cached successfully')
		} catch (error) {
			console.error('Failed to cache audio files:', error)
		} finally {
			console.timeEnd('cacheAllAudioFiles')
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
