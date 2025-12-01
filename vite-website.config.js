import {resolve} from 'path'
import {execSync} from 'child_process'
import {defineConfig} from 'vite'
import pkg from './package.json' with {type: 'json'}

// https://vitejs.dev/config/
export default defineConfig({
	build: {
		emptyOutDir: false
	},
	define: {
		__GIT_INFO__: JSON.stringify(getGitInfo())
	}
})

function getGitInfo() {
	try {
		const sha = execSync('git rev-parse --short HEAD').toString().trim()
		const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim()
		const date = execSync('git log -1 --format=%cI').toString().trim()
		const remoteUrl = execSync('git config --get remote.origin.url').toString().trim()
		return {sha, branch, date, remoteUrl, version: pkg.version}
	} catch (e) {
		console.warn('Failed to get git info:', e.message)
		return {sha: 'unknown', branch: 'unknown', date: 'unknown', remoteUrl: 'unknown', version: pkg.version}
	}
}
