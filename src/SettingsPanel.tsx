import { useEffect, useRef, useState } from 'react'
import { Theme, Settings } from './settingsStore'

// structural type so this stays app-agnostic (no import from i18n)
type Translate = (key: string) => string

const THEME_OPTIONS: { value: Theme, icon: string, key: string }[] = [
	{ value: 'system', icon: '🖥️', key: 'theme.system' },
	{ value: 'light', icon: '☀️', key: 'theme.light' },
	{ value: 'dark', icon: '🌙', key: 'theme.dark' },
]

type Props = {
	settings: Settings,
	// the full language list, so the checklist always shows everything supported
	languages: { code: string, display: string }[],
	// true while flight-mode downloads are running
	caching: boolean,
	// number of sound files currently in the cache
	cachedCount: number,
	// when true (game in progress), the language list can't be changed
	locked: boolean,
	// UI-string translator (falls back to English)
	t: Translate,
	// the current interface language and the options for its dropdown
	uiLanguage: string,
	uiLanguages: { code: string, display: string }[],
	onSetUiLanguage: (code: string) => void,
	onChange: (settings: Settings) => void,
	onClearCache: () => void,
}

export default function SettingsPanel({ settings, languages, caching, cachedCount, locked, t, uiLanguage, uiLanguages, onSetUiLanguage, onChange, onClearCache }: Readonly<Props>) {
	const [open, setOpen] = useState(false)
	const containerRef = useRef<HTMLDivElement | null>(null)

	// close the panel when clicking anywhere outside it
	useEffect(() => {
		if (!open) return
		const handleOutside = (e: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setOpen(false)
			}
		}
		document.addEventListener('mousedown', handleOutside)
		return () => document.removeEventListener('mousedown', handleOutside)
	}, [open])

	const setTheme = (theme: Theme) => onChange({ ...settings, theme })

	const toggleLanguage = (code: string) => {
		const hiddenLanguages = settings.hiddenLanguages.includes(code)
			? settings.hiddenLanguages.filter(c => c !== code)
			: [...settings.hiddenLanguages, code]
		onChange({ ...settings, hiddenLanguages })
	}

	const showAllLanguages = () => onChange({ ...settings, hiddenLanguages: [] })
	const hideAllLanguages = () => onChange({ ...settings, hiddenLanguages: languages.map(l => l.code) })

	return (
		<div className="settings" ref={containerRef}>
			<button
				type="button"
				className={open ? 'settings-button open' : 'settings-button'}
				aria-label={t('settings.title')}
				aria-expanded={open}
				title={t('settings.title')}
				onClick={() => setOpen(o => !o)}
			>
				⚙️
			</button>

			{open && (
				<div className="settings-panel" role="dialog" aria-label={t('settings.title')}>
					<div className="settings-row">
						<div className="settings-segmented" role="group" aria-label={t('group.theme')}>
							{THEME_OPTIONS.map(opt => (
								<button
									key={opt.value}
									type="button"
									className={settings.theme === opt.value ? 'segment selected' : 'segment'}
									aria-pressed={settings.theme === opt.value}
									aria-label={t(opt.key)}
									title={t(opt.key)}
									onClick={() => setTheme(opt.value)}
								>
									{opt.icon}
								</button>
							))}
						</div>
					</div>

					<div className="settings-row">
						<label className="settings-uilang">
							<span className="settings-uilang-icon" aria-hidden="true">👁️</span>
							<select
								className="language-select"
								aria-label={t('uiLanguage')}
								title={t('uiLanguage')}
								value={uiLanguage}
								onChange={(e) => onSetUiLanguage(e.target.value)}
							>
								{uiLanguages.map(l => (
									<option key={`ui-${l.code}`} value={l.code}>{l.display}</option>
								))}
							</select>
						</label>
					</div>

					<div className="settings-row">
						<div className="settings-select-all">
							<button
								type="button"
								aria-label={t('selectAllLanguages')}
								title={t('selectAll')}
								disabled={locked}
								onClick={showAllLanguages}
							>
								✅
							</button>
							<button
								type="button"
								aria-label={t('deselectAllLanguages')}
								title={t('deselectAll')}
								disabled={locked}
								onClick={hideAllLanguages}
							>
								⬜
							</button>
						</div>
						<div className="settings-checklist" role="group" aria-label={t('group.languages')}>
							{languages.map(l => {
								const shown = !settings.hiddenLanguages.includes(l.code)
								return (
									<label key={`setting-lang-${l.code}`} className="settings-check">
										<input
											type="checkbox"
											checked={shown}
											disabled={locked}
											onChange={() => toggleLanguage(l.code)}
										/>
										{l.display}
									</label>
								)
							})}
						</div>
					</div>

					<div className="settings-cache-row">
						<button
							type="button"
							className={
								'settings-flight-mode'
								+ (settings.flightMode ? ' on' : '')
								+ (caching ? ' busy' : '')
							}
							aria-label={t('flight.label')}
							aria-pressed={settings.flightMode}
							title={t('flight.title')}
							onClick={() => onChange({ ...settings, flightMode: !settings.flightMode })}
						>
							✈️
						</button>
						<span className="settings-cache-count" title={t('cache.count')}>
							🔊 {cachedCount}
						</span>
						<button
							type="button"
							className="settings-cache-clear"
							aria-label={t('cache.clear')}
							title={settings.flightMode
								? t('cache.clearTitleDisabled')
								: t('cache.clearTitle')}
							disabled={settings.flightMode || caching}
							onClick={onClearCache}
						>
							🗑️
						</button>
					</div>

					<div className="settings-about">
						<span>v{__APP_VERSION__}</span>
						<a
							href="https://github.com/amerharb/arqaam"
							target="_blank"
							rel="noopener noreferrer"
						>
							Amer Harb · GitHub
						</a>
					</div>
				</div>
			)}
		</div>
	)
}
