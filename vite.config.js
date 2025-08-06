import {resolve} from 'path'
import {defineConfig} from 'vite'

export default defineConfig({
	build: {
		lib: {
			// Could also be a dictionary or array of multiple entry points
			entry: resolve(__dirname, 'src/main.js'),
			name: 'radio4000Sdk',
			// the proper extensions will be added
			fileName: 'sdk',
			formats: ['es']
		},
		rollupOptions: {
			// We don't do this, because we want supabase-js inside our own bundle for ease.
			// // make sure to externalize deps that shouldn't be bundled into your library
			// external: ['@supabase/supabase-js'],
			// output: {
			// 	// Provide global variables to use in the UMD build
			// 	// for externalized deps
			// 	globals: {
			// 		['@supabase/supabase-js']: 'supabase',
			// 	},
			// },
		}
	}
})
