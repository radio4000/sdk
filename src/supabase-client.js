import * as dotenv from 'dotenv'
dotenv.config()
import {createClient} from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY

const isBrowser = typeof window !== 'undefined'

const supabase = createClient(supabaseUrl, supabaseKey, {
	auth: {
		// Only attempt local storage in a browser.
		persistSession: isBrowser,
	},
})

export default supabase
export {supabase}
