import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from './package.json'

export default defineConfig({
	plugins: [react()],
	define: {
		// expose the app version to the client (see __APP_VERSION__ in vite-env.d.ts)
		__APP_VERSION__: JSON.stringify(pkg.version),
	},
	server: {
		port: 3000,
	},
})
