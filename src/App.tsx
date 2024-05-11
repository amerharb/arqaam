import React, {useState} from 'react'
import './App.css'
import {useCallback} from 'react'
import {Analytics} from '@vercel/analytics/react'

function App() {
	type Lang = { code: string, display: string, flag?: string }
	const langList: Lang[] = [
		{code: 'ar', display: 'Arabic', flag: '🇵🇸'},
		{code: 'en', display: 'English', flag: '🇬🇧'},
		{code: 'de', display: 'German', flag: '🇩🇪'},
		{code: 'sv', display: 'Swedish', flag: '🇸🇪'},
		// TODO: Add more languages later
		// {code: 'fr', display: 'French', flag: '🇫🇷'},
		// {code: 'tr', display: 'Turkish', flag: '🇹🇷'},
		// {code: 'fa', display: 'Farsi', flag: '🇮🇷'},
		// {code: 'fi', display: 'Finnish', flag: '🇫🇮'},
		// {code: 'ru', display: 'Russian', flag: '🇷🇺'},
		// {code: 'zh', display: 'Chinese', flag: '🇨🇳'},
		// {code: 'es', display: 'Spanish', flag: '🇪🇸'},
	]
	const [lang, setSelectedLanguage] = useState(langList[0])

	const handleLanguageChange = (lang: Lang) => {
		setSelectedLanguage(lang)
	}

	const playSound = useCallback(async (langCode: string, n: number) => {
		try {
			const audio = new Audio(`/sounds/${langCode}/${n}.aac`)
			await audio.play()
		} catch (e) {
			console.error(e)
		}
	}, [])

	return (
		<div className="Arqam">
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
			<div>
				{[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
					<button
						key={`number-${n}`}
						className="button-number"
						onClick={() => playSound(lang.code, n)}
					>
						{n}
					</button>
				))}
			</div>
			<Analytics/>
		</div>
	)
}

export default App
