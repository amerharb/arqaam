import './App.css'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Analytics } from '@vercel/analytics/react'
import SettingsPanel from './SettingsPanel'
import { isVisible } from './featureFlags'
import { Settings, DEFAULT_SETTINGS, loadSettings, saveSettings, applyTheme, preferredLanguage } from './settingsStore'
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

const randomOf = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)]

// short win/lose feedback sounds
function playFx(name: 'correct' | 'wrong' | 'giveup') {
	try {
		new Audio(`/sound/fx/${name}.aac`).play().catch(() => {})
	} catch {
		// ignore
	}
}

function App() {
	// everything the build supports (after the beta feature flag)
	const ALL_LANGUAGES: Lang[] = [ar, en, de, sv, fr, tr, fa, ru, fi, es].filter(isVisible)
	const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
	// code of the selected language (the spoken and spelled number words); defaults
	// to the browser's preferred language on first load
	const [selectedCode, setSelectedCode] = useState(() => preferredLanguage())
	const [spelledNumber, setSpelledNumber] = useState('')
	// number whose sound is playing, to show the play icon on its button
	const [playingNumber, setPlayingNumber] = useState<number | null>(null)
	// true while flight-mode downloads are in progress, to show it on the toggle
	const [caching, setCaching] = useState(false)
	// how many sound files are currently in the cache, shown in settings
	const [cachedCount, setCachedCount] = useState(0)

	// the sound currently playing, so starting a new one can stop it first
	const playingAudio = useRef<HTMLAudioElement | null>(null)
	// pending "play the next prompt" timer during the game, so it can be cancelled
	// if the game ends (or is stopped) before it fires — otherwise a late timer
	// would start a sound after the game is already over
	const promptTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

	const stopSound = useCallback(() => {
		if (promptTimer.current) {
			clearTimeout(promptTimer.current)
			promptTimer.current = null
		}
		if (playingAudio.current) {
			playingAudio.current.pause()
			URL.revokeObjectURL(playingAudio.current.src)
			playingAudio.current = null
		}
		setPlayingNumber(null)
	}, [])

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
				...DIGITS.map(n => `/sound/lang/${l.code}/${n}.aac`),
				`/sound/lang/${l.code}/${l.code}.aac`,
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
	// the network, storing it for next time. Starting a new sound stops the one
	// currently playing. Number sounds show the play icon on their button.
	const playSound = useCallback(async (langCode: string, n?: number) => {
		try {
			const audioUrl = `/sound/lang/${langCode}/${n ?? langCode}.aac`
			const blob = await getAudioBlob(audioUrl)
			if (!blob) return
			const objectUrl = URL.createObjectURL(blob)
			if (playingAudio.current) {
				playingAudio.current.pause()
				URL.revokeObjectURL(playingAudio.current.src)
			}
			const audio = new Audio(objectUrl)
			audio.onended = () => {
				URL.revokeObjectURL(objectUrl)
				setPlayingNumber(null)
			}
			playingAudio.current = audio
			await audio.play()
			setPlayingNumber(n ?? null)
			refreshCacheCount() // playing may have added the file to the cache
		} catch (e) {
			console.error(e)
		}
	}, [refreshCacheCount])

	// play a number sound without touching the play-icon UI (used by the game,
	// where a ▶ on the target button would reveal the answer)
	const playFile = useCallback(async (langCode: string, n: number) => {
		try {
			const blob = await getAudioBlob(`/sound/lang/${langCode}/${n}.aac`)
			if (!blob) return
			const objectUrl = URL.createObjectURL(blob)
			if (playingAudio.current) {
				playingAudio.current.pause()
				URL.revokeObjectURL(playingAudio.current.src)
			}
			const audio = new Audio(objectUrl)
			audio.onended = () => URL.revokeObjectURL(objectUrl)
			playingAudio.current = audio
			await audio.play()
		} catch (e) {
			console.error(e)
		}
	}, [])

	// ---- Game mode ----
	const [gameOn, setGameOn] = useState(false)
	const [target, setTarget] = useState<number | null>(null)  // number to find
	const [solved, setSolved] = useState<number[]>([])         // numbers already played (guessed or given up)
	const [wrongGuesses, setWrongGuesses] = useState<number[]>([]) // wrong numbers for the CURRENT target (temporarily disabled)
	const [mistakes, setMistakes] = useState(0)      // wrong taps this game
	const [giveUps, setGiveUps] = useState(0)        // numbers given up on this game
	const [gaveUpNumbers, setGaveUpNumbers] = useState<number[]>([]) // numbers given up on, to mark them 🤷‍♂️
	const gameStart = useRef(0)                       // Date.now() when the game began
	const [result, setResult] = useState<{ played: number, total: number, mistakes: number, giveUps: number, ms: number } | null>(null)
	const [feedback, setFeedback] = useState<{ emoji: string, id: number } | null>(null)
	const feedbackId = useRef(0)
	const [preparing, setPreparing] = useState(false) // downloading game sounds before start

	const canPlayGame = LANGUAGES.length > 0

	const formatDuration = (ms: number) => {
		const total = Math.round(ms / 1000)
		const m = Math.floor(total / 60)
		const s = total % 60
		return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`
	}

	const flashFeedback = (emoji: string) => {
		feedbackId.current += 1
		const id = feedbackId.current
		setFeedback({ emoji, id })
		setTimeout(() => setFeedback(f => (f && f.id === id ? null : f)), 700)
	}

	const startGame = async () => {
		if (!canPlayGame || !lang || preparing) return
		stopSound()
		// the board keeps the numbers in order (no shuffle) — only the prompts are random
		// pre-load every prompt sound before the game begins, so gameplay never waits
		// on the network (cached in IndexedDB, which also works in Safari Lockdown)
		setPreparing(true)
		await ensureCached(DIGITS.map(n => `/sound/lang/${lang.code}/${n}.aac`))
		refreshCacheCount()
		setPreparing(false)
		const first = randomOf(DIGITS)
		setSolved([])
		setWrongGuesses([])
		setMistakes(0)
		setGiveUps(0)
		setGaveUpNumbers([])
		setResult(null)
		setSpelledNumber('')
		gameStart.current = Date.now()
		setTarget(first)
		setGameOn(true)
		playFile(lang.code, first)
	}

	const endGame = () => {
		stopSound()
		setGameOn(false)
		setTarget(null)
		setWrongGuesses([])
		setFeedback(null)
		// show the result for the numbers played so far
		setResult({
			played: solved.length,
			total: DIGITS.length,
			mistakes,
			giveUps,
			ms: Date.now() - gameStart.current,
		})
	}

	// mark the target number played and move on (or finish). mistakesTotal and
	// giveUpsTotal are the running counts to record if this was the last number.
	const advance = (n: number, mistakesTotal: number, giveUpsTotal: number) => {
		// cancel any not-yet-fired next-prompt timer (e.g. the player answered the
		// last number before the previous prompt was scheduled to play)
		if (promptTimer.current) {
			clearTimeout(promptTimer.current)
			promptTimer.current = null
		}
		// reaching the correct answer re-enables the numbers marked wrong this round
		setWrongGuesses([])
		const nextSolved = [...solved, n]
		setSolved(nextSolved)
		const remaining = DIGITS.filter(d => !nextSolved.includes(d))
		if (remaining.length === 0) {
			// all numbers played — game over.
			stopSound()
			setGameOn(false)
			setTarget(null)
			setResult({
				played: nextSolved.length,
				total: DIGITS.length,
				mistakes: mistakesTotal,
				giveUps: giveUpsTotal,
				ms: Date.now() - gameStart.current,
			})
		} else {
			const next = randomOf(remaining)
			setTarget(next)
			// let the feedback land before the next prompt
			promptTimer.current = setTimeout(() => {
				if (lang) playFile(lang.code, next)
			}, 650)
		}
	}

	const guessNumber = (n: number) => {
		if (target === null || solved.includes(n) || wrongGuesses.includes(n)) return
		if (n === target) {
			playFx('correct')
			flashFeedback('👍')
			advance(n, mistakes, giveUps)
		} else {
			// temporarily disable this wrong number (with a 👎 marker) until the round is won
			setWrongGuesses(w => (w.includes(n) ? w : [...w, n]))
			setMistakes(m => m + 1)
			playFx('wrong')
			flashFeedback('👎')
		}
	}

	// give up on the current number: counts as played and as a give-up (not a mistake)
	const giveUp = () => {
		if (target === null) return
		const nextGiveUps = giveUps + 1
		setGiveUps(nextGiveUps)
		setGaveUpNumbers(g => (g.includes(target) ? g : [...g, target]))
		playFx('giveup')
		flashFeedback('🤷‍♂️')
		advance(target, mistakes, nextGiveUps)
	}

	return (
		<div className="Arqaam">
			<div className="top-controls">
				<button
					className={(gameOn ? 'game-toggle on' : 'game-toggle') + (preparing ? ' busy' : '')}
					aria-label={gameOn ? 'End game' : 'Start game'}
					aria-pressed={gameOn}
					title={
						gameOn
							? 'End game'
							: (canPlayGame ? 'Start game' : 'Select at least one language to play')
					}
					disabled={(!gameOn && !canPlayGame) || preparing}
					onClick={() => (gameOn ? endGame() : startGame())}
				>
					🎮
				</button>
				<select
					className="language-select"
					title="Language of the numbers"
					value={lang ? lang.code : ''}
					disabled={gameOn}
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
					locked={gameOn}
					onChange={updateSettings}
					onClearCache={clearSoundCache}
				/>
			</div>
			<hgroup>
				{DIGITS.map(n => {
					const isGivenUp = gameOn && gaveUpNumbers.includes(n)
					const isSolved = gameOn && solved.includes(n) && !isGivenUp
					const isWrong = gameOn && wrongGuesses.includes(n)
					return (
						<button
							key={`number-${n}`}
							className={'button-number' + (playingNumber === n ? ' playing' : '') + (isWrong ? ' wrong' : '')}
							title={gameOn ? '' : (lang ? lang.numbers[n] : '🤷‍♂️')}
							disabled={isSolved || isGivenUp || isWrong}
							onClick={() => {
								if (gameOn) {
									guessNumber(n)
								} else if (playingNumber === n) {
									// clicking the playing number again stops the sound
									stopSound()
								} else if (!lang) {
									// every language is hidden: nothing to say
									setSpelledNumber('🤷‍♂️')
								} else {
									setResult(null)
									playSound(lang.code, n)
									setSpelledNumber(lang.numbers[n])
								}
							}}
						>
							{n}
							{playingNumber === n && <span className="play-icon">▶</span>}
							{isSolved && <span className="swatch-mark">👍</span>}
							{isGivenUp && <span className="swatch-mark">🤷‍♂️</span>}
							{isWrong && <span className="swatch-mark">👎</span>}
						</button>
					)
				})}
			</hgroup>
			<hgroup>
				{!gameOn && result ? (
					<div className="game-result">
						<span title="Numbers played">🏁 {result.played} / {result.total}</span>
						<span title="Mistakes">❌ {result.mistakes}</span>
						<span title="Give-ups">🤷‍♂️ {result.giveUps}</span>
						<span title="Time">⏱️ {formatDuration(result.ms)}</span>
					</div>
				) : (
					<h1>
						{preparing ? '⏳' : gameOn ? `${solved.length} / ${DIGITS.length}` : spelledNumber}
					</h1>
				)}
			</hgroup>
			{gameOn && (
				<button
					className="game-giveup"
					aria-label="Give up"
					title="Give up: reveal this one and move on"
					onClick={giveUp}
				>
					🤷‍♂️
				</button>
			)}
			{feedback && (
				<div key={feedback.id} className="game-feedback" aria-hidden="true">
					{feedback.emoji}
				</div>
			)}
			<Analytics/>
		</div>
	)
}

export default App
