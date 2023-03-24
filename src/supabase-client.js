import {createClient} from '@supabase/supabase-js'

const supabaseUrl = process?.env.SUPABASE_URL || 'https://myjhnqgfwqtcicnvcwcj.supabase.co'
const supabaseKey = process?.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MTQxNTQ3MiwiZXhwIjoxOTU2OTkxNDcyfQ.gySR3Lv-m_CIj2Eyx6kfyOdwwMXEOFOgeHSjADqcM4Y'

console.log(supabaseUrl)

const isBrowser = typeof window !== 'undefined'

const supabase = createClient(supabaseUrl, supabaseKey, {
	auth: {
		// Only attempt local storage in a browser.
		persistSession: isBrowser,
	},
})

export default supabase
export {supabase}
