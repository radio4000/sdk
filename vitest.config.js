import {defineConfig, loadEnv} from 'vite'

export default defineConfig(({mode}) => {
	const env = loadEnv(mode, process.cwd(), '')
	return {
		test: {
			include: ['tests/**/*.js'],
			exclude: ['tests/_*.js'],
			env,
			reporters: ['dot'],
			onConsoleLog: () => false,
		}
	}
})
