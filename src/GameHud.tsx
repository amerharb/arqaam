/*
 * The two game-only app-bar segments: the live score (frozen when the round
 * ends) and the round actions (👂 replay, 🤷‍♂️ give up, ✋ stop, 🔄 restart).
 */

const formatDuration = (ms: number) => {
	const total = Math.round(ms / 1000)
	const m = Math.floor(total / 60)
	const s = total % 60
	return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`
}

type ScoreProps = {
	// tooltip of the 🏁 count, e.g. "Days played"
	playedTitle: string,
	played: number,
	total: number,
	mistakes: number,
	giveUps: number,
	ms: number,
}

export function GameScore({ playedTitle, played, total, mistakes, giveUps, ms }: Readonly<ScoreProps>) {
	return (
		<div className="game-score">
			<span title={playedTitle}>🏁 {played} / {total}</span>
			<span title="Mistakes">👎 {mistakes}</span>
			<span title="Give-ups">🤷‍♂️ {giveUps}</span>
			<span title="Time">⏱️ {formatDuration(ms)}</span>
		</div>
	)
}

type ActionsProps = {
	// no round is running (between rounds): 👂, 🤷‍♂️ and ✋ are disabled
	roundActive: boolean,
	// 👂 is also pointless while muted
	muted: boolean,
	// 🔄 is disabled while the next round's sounds are still downloading
	preparing: boolean,
	onReplay: () => void,
	onGiveUp: () => void,
	onStop: () => void,
	onRestart: () => void,
}

export function GameActions({ roundActive, muted, preparing, onReplay, onGiveUp, onStop, onRestart }: Readonly<ActionsProps>) {
	return (
		<div className="game-actions">
			<button
				aria-label="Replay the sound"
				title="Play the prompt again"
				disabled={muted || !roundActive}
				onClick={onReplay}
			>
				👂
			</button>
			<button
				aria-label="Give up"
				title="Give up: reveal this one and move on"
				disabled={!roundActive}
				onClick={onGiveUp}
			>
				🤷‍♂️
			</button>
			<button
				aria-label="Stop round"
				title="Stop this round (the score stays until you restart or leave the game)"
				disabled={!roundActive}
				onClick={onStop}
			>
				✋
			</button>
			<button
				aria-label="Restart round"
				title="Restart: start a new round"
				disabled={preparing}
				onClick={onRestart}
			>
				🔄
			</button>
		</div>
	)
}
