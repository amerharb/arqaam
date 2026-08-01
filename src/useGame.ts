/*
 * The game-mode state machine, shared by the sister projects.
 *
 * 🕹️ enters game mode and starts a round: the prompts are pre-loaded, a random
 * target is spoken, and the player taps items on the board. A wrong tap is
 * temporarily disabled with a 👎 marker until the round is won; 🤷‍♂️ gives the
 * target up. The round ends when everything has been played or ✋ is pressed —
 * the clock and stats freeze but game mode stays on — and 🔄 starts a fresh
 * round. Clicking 🕹️ again leaves game mode entirely.
 */
import { useEffect, useRef, useState } from 'react'

const randomOf = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)]

type AudioControls = {
	stopSound: () => void,
	play: (url: string, code?: string) => void | Promise<void>,
	schedulePrompt: (url: string, delayMs: number) => void,
	cancelPrompt: () => void,
	fx: (name: 'correct' | 'wrong' | 'giveup' | 'complete' | 'stopped') => void,
}

/*
 * What one finished round scored. Kept in a list while game mode is on (so a
 * player can look back over the session) and thrown away on leaving it.
 */
export type RoundResult = {
	// how many items were played — guessed or given up
	solved: number,
	// how many were on the board
	total: number,
	// how long the round took
	elapsedMs: number,
	// wrong taps
	mistakes: number,
	// targets revealed with 🤷‍♂️
	giveUps: number,
	// which flavour of round it was: the selected language, or the anthem type
	mode: string,
}
// a round that ran to the end is simply one where solved === total

type UseGameOptions<T> = {
	// false keeps 🕹️ disabled (e.g. no language visible)
	canPlay: boolean,
	// the board for a new round, in the order it should be shown
	buildBoard: () => T[],
	// the sound file of an item's prompt
	promptUrl: (item: T) => string,
	// pre-download the round's prompts so gameplay never waits on the network
	preload: (urls: string[]) => Promise<void>,
	audio: AudioControls,
	// labels the round in its result — the selected language or anthem type
	mode: string,
	// called when a round starts (e.g. to clear the clicked-name display)
	onRoundStart?: () => void,
}

export function useGame<T extends { code: string }>(
	{ canPlay, buildBoard, promptUrl, preload, audio, mode, onRoundStart }: UseGameOptions<T>,
) {
	const [gameOn, setGameOn] = useState(false)
	const [board, setBoard] = useState<T[]>([])                // this round's board
	const [target, setTarget] = useState<string | null>(null)  // code to find
	const [solved, setSolved] = useState<string[]>([])         // played (guessed or given up)
	const [wrongGuesses, setWrongGuesses] = useState<string[]>([]) // wrong for the CURRENT target (temporarily disabled)
	const [mistakes, setMistakes] = useState(0)      // wrong taps this round
	const [giveUps, setGiveUps] = useState(0)        // targets given up this round
	const [gaveUpCodes, setGaveUpCodes] = useState<string[]>([]) // given up on, to mark them 🤷‍♂️
	const roundStart = useRef(0)                     // Date.now() when the round began
	// when the round ended (all played, or ✋): freezes the clock and stats until
	// 🔄 starts a new round or 🕹️ leaves game mode; null while a round is running
	const [endedAt, setEndedAt] = useState<number | null>(null)
	const [feedback, setFeedback] = useState<{ emoji: string, id: number } | null>(null)
	const feedbackId = useRef(0)
	const [preparing, setPreparing] = useState(false) // downloading prompt sounds before start
	// every round finished so far this game session, newest last
	const [results, setResults] = useState<RoundResult[]>([])

	// record a finished round (played out or stopped early with ⏹️)
	const recordRound = (solvedCount: number, giveUpCount: number) => {
		setResults(r => [...r, {
			solved: solvedCount,
			total: board.length,
			elapsedMs: Date.now() - roundStart.current,
			mistakes,
			giveUps: giveUpCount,
			mode,
		}])
	}

	// tick every second while a round runs, so the live ⏱️ time updates
	const [, setClockTick] = useState(0)
	useEffect(() => {
		if (!gameOn || endedAt !== null) return
		const id = setInterval(() => setClockTick(t => t + 1), 1000)
		return () => clearInterval(id)
	}, [gameOn, endedAt])

	const flashFeedback = (emoji: string) => {
		feedbackId.current += 1
		const id = feedbackId.current
		setFeedback({ emoji, id })
		setTimeout(() => setFeedback(f => (f && f.id === id ? null : f)), 700)
	}

	// start a round (also used by 🔄 to restart): preload the prompt sounds,
	// reset the counters, pick the first target and turn game mode on
	const startRound = async () => {
		if (!canPlay || preparing) return
		audio.stopSound()
		const items = buildBoard()
		setPreparing(true)
		await preload(items.map(promptUrl))
		setPreparing(false)
		const first = randomOf(items)
		setBoard(items)
		setSolved([])
		setWrongGuesses([])
		setMistakes(0)
		setGiveUps(0)
		setGaveUpCodes([])
		setEndedAt(null)
		onRoundStart?.()
		roundStart.current = Date.now()
		setTarget(first.code)
		setGameOn(true)
		audio.play(promptUrl(first))
	}

	// 🕹️ off: leave game mode entirely (hides the game score and actions)
	const exitGame = () => {
		audio.stopSound()
		setGameOn(false)
		setTarget(null)
		setWrongGuesses([])
		setFeedback(null)
		setEndedAt(null)
		// the session's results only live as long as game mode does
		setResults([])
	}

	// ✋: stop the current round early — freeze the clock and stats, stay in game mode
	const stopRound = () => {
		if (target === null) return
		audio.stopSound()
		recordRound(solved.length, giveUps)
		audio.fx('stopped')
		setTarget(null)
		setWrongGuesses([])
		setEndedAt(Date.now())
	}

	// 👂: play the current prompt again
	const replay = () => {
		const item = board.find(i => i.code === target)
		if (item) audio.play(promptUrl(item))
	}

	// mark the target played and move on (or finish the round)
	const advance = (code: string, giveUpCount: number) => {
		// cancel any not-yet-fired next-prompt timer (e.g. the player answered
		// the last target before the previous prompt was scheduled to play)
		audio.cancelPrompt()
		// reaching the correct answer re-enables the items marked wrong this round
		setWrongGuesses([])
		const nextSolved = [...solved, code]
		setSolved(nextSolved)
		const remaining = board.filter(i => !nextSolved.includes(i.code))
		if (remaining.length === 0) {
			// all played — the round is over, but game mode stays on until
			// 🕹️ is clicked again (or ▶️ starts a new round)
			audio.stopSound()
			recordRound(nextSolved.length, giveUpCount)
			audio.fx('complete')
			setTarget(null)
			setEndedAt(Date.now())
		} else {
			const next = randomOf(remaining)
			setTarget(next.code)
			// let the feedback land before the next prompt
			audio.schedulePrompt(promptUrl(next), 650)
		}
	}

	const guess = (code: string) => {
		if (target === null || solved.includes(code) || wrongGuesses.includes(code)) return
		if (code === target) {
			audio.fx('correct')
			flashFeedback('👍')
			advance(code, giveUps)
		} else {
			// temporarily disable this wrong item (with a 👎 marker) until the round is won
			setWrongGuesses(w => (w.includes(code) ? w : [...w, code]))
			setMistakes(m => m + 1)
			audio.fx('wrong')
			flashFeedback('👎')
		}
	}

	// give up on the current target: counts as played and as a give-up (not a mistake)
	const giveUp = () => {
		if (target === null) return
		const nextGiveUps = giveUps + 1
		setGiveUps(nextGiveUps)
		setGaveUpCodes(g => (g.includes(target) ? g : [...g, target]))
		audio.fx('giveup')
		flashFeedback('🤷‍♂️')
		advance(target, nextGiveUps)
	}

	return {
		canPlay,
		gameOn, board, target, solved, wrongGuesses, mistakes, giveUps, gaveUpCodes,
		endedAt, preparing, feedback, results,
		// how long the round has been running (frozen once it ends)
		elapsedMs: (endedAt ?? Date.now()) - roundStart.current,
		startRound, exitGame, stopRound, replay, guess, giveUp,
		// one control for ⏹️/▶️: stop the running round, or start a fresh one
		toggleRound: () => (target !== null ? stopRound() : startRound()),
	}
}
