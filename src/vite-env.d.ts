/// <reference types="vite/client" />

interface ImportMetaEnv {
	// Set VITE_SHOW_BETA=true to reveal beta languages in a build.
	readonly VITE_SHOW_BETA?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}

// injected at build time from package.json (see vite.config.ts)
declare const __APP_VERSION__: string
