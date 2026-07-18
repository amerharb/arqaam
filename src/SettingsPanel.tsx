import { useEffect, useRef, useState } from 'react'
import { Theme, Settings } from './settingsStore'

const THEME_OPTIONS: { value: Theme, icon: string, name: string }[] = [
	{ value: 'system', icon: '🖥️', name: 'System' },
	{ value: 'light', icon: '☀️', name: 'Light' },
	{ value: 'dark', icon: '🌙', name: 'Dark' },
]

type Props = {
	settings: Settings,
	onChange: (settings: Settings) => void,
}

export default function SettingsPanel({ settings, onChange }: Readonly<Props>) {
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
				</div>
			)}
		</div>
	)
}
