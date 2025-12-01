import {defineConfig} from 'vite'
import pkg from './package.json' with {type: 'json'}

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		emptyOutDir: false
	},
	define: {
		'import.meta.env.PKG_VERSION': JSON.stringify(pkg.version)
	}
})
