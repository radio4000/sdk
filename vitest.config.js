import {defineConfig} from 'vitest/config'

export default defineConfig({
	test: {
		include: ['tests/**/*.js'],
		exclude: ['tests/_*.js'],
		env: {
			// Load environment variables from .env file
			// Vitest will automatically load .env files
		}
	},
	envDir: '.'
})
