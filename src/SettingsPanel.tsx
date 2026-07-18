import { useEffect, useRef, useState } from 'react'
import { Theme, Settings } from './settingsStore'

const THEME_OPTIONS: { value: Theme, icon: string, name: string }[] = [
	{ value: 'system', icon: '🖥️', name: 'System' },
	{ value: 'light', icon: '☀️', name: 'Light' },
	{ value: 'dark', icon: '🌙', name: 'Dark' },
]

type Props = {
	settings: Settings,
	// the full language list, so the checklist always shows everything supported
	languages: { code: string, display: string }[],
	// true while flight-mode downloads are running
	caching: boolean,
	// number of sound files currently in the cache
	cachedCount: number,
	onChange: (settings: Settings) => void,
	onClearCache: () => void,
}

export default function SettingsPanel({ settings, languages, caching, cachedCount, onChange, onClearCache }: Readonly<Props>) {
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
				aria-label="Settings"
				aria-expanded={open}
				title="Settings"
				onClick={() => setOpen(o => !o)}
			>
				⚙️
			</button>

			{open && (
				<div className="settings-panel" role="dialog" aria-label="Settings">
					<div className="settings-row">
						<div className="settings-segmented" role="group" aria-label="Theme">
							{THEME_OPTIONS.map(opt => (
								<button
									key={opt.value}
									type="button"
									className={settings.theme === opt.value ? 'segment selected' : 'segment'}
									aria-pressed={settings.theme === opt.value}
									aria-label={opt.name}
									title={opt.name}
									onClick={() => setTheme(opt.value)}
								>
									{opt.icon}
								</button>
							))}
						</div>
					</div>

					<div className="settings-row">
						<div className="settings-select-all">
							<button
								type="button"
								aria-label="Select all languages"
								title="Select all"
								onClick={showAllLanguages}
							>
								✅
							</button>
							<button
								type="button"
								aria-label="Deselect all languages"
								title="Deselect all"
								onClick={hideAllLanguages}
							>
								⬜
							</button>
						</div>
						<div className="settings-checklist" role="group" aria-label="Languages">
							{languages.map(l => {
								const shown = !settings.hiddenLanguages.includes(l.code)
								return (
									<label key={`setting-lang-${l.code}`} className="settings-check">
										<input
											type="checkbox"
											checked={shown}
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
							aria-label="flight mode"
							aria-pressed={settings.flightMode}
							title="Flight mode: cache all visible sounds"
							onClick={() => onChange({ ...settings, flightMode: !settings.flightMode })}
						>
							✈️
						</button>
						<span className="settings-cache-count" title="Cached sound files">
							🔊 {cachedCount}
						</span>
						<button
							type="button"
							className="settings-cache-clear"
							aria-label="Clear sound cache"
							title={settings.flightMode
								? 'Clear sound cache (not available in flight mode)'
								: 'Clear sound cache: delete the downloaded sound files'}
							disabled={settings.flightMode || caching}
							onClick={onClearCache}
						>
							🗑️
						</button>
					</div>
				</div>
			)}
		</div>
	)
}
