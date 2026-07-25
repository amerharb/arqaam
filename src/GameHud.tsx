/*
 * The two game-only app-bar segments: the live score (frozen when the round
 * ends) and the round actions (👂 replay, 🤷‍♂️ give up, ✋ stop, 🔄 restart).
 *
 * UI strings come from a translate function `t` passed by the app, so these
 * segments stay presentational and localization lives in one place.
 */

// structural type so this stays app-agnostic (no import from i18n)
type Translate = (key: string) => string

const formatDuration = (ms: number) => {
	const total = Math.round(ms / 1000)
	const m = Math.floor(total / 60)
	const s = total % 60
	return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`
}

type ScoreProps = {
	t: Translate,
	played: number,
	total: number,
	mistakes: number,
	giveUps: number,
	ms: number,
}

export function GameScore({ t, played, total, mistakes, giveUps, ms }: Readonly<ScoreProps>) {
	return (
		<div className="game-score">
			<span title={t('score.played')}>🏁 {played} / {total}</span>
			<span title={t('score.mistakes')}>👎 {mistakes}</span>
			<span title={t('score.giveUps')}>🤷‍♂️ {giveUps}</span>
			<span title={t('score.time')}>⏱️ {formatDuration(ms)}</span>
		</div>
	)
}

type ActionsProps = {
	t: Translate,
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

export function GameActions({ t, roundActive, muted, preparing, onReplay, onGiveUp, onStop, onRestart }: Readonly<ActionsProps>) {
	return (
		<div className="game-actions">
			<button
				aria-label={t('action.replay')}
				title={t('action.replayTitle')}
				disabled={muted || !roundActive}
				onClick={onReplay}
			>
				👂
			</button>
			<button
				aria-label={t('action.giveUp')}
				title={t('action.giveUpTitle')}
				disabled={!roundActive}
				onClick={onGiveUp}
			>
				🤷‍♂️
			</button>
			<button
				aria-label={t('action.stop')}
				title={t('action.stopTitle')}
				disabled={!roundActive}
				onClick={onStop}
			>
				✋
			</button>
			<button
				aria-label={t('action.restart')}
				title={t('action.restartTitle')}
				disabled={preparing}
				onClick={onRestart}
			>
				🔄
			</button>
		</div>
	)
}
