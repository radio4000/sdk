// import * as dotenv from 'dotenv' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
// dotenv.config()

import {createClient} from '@supabase/supabase-js'

// const supabaseUrl = process.env.SUPABASE_URL
// const supabaseKey = process.env.SUPABASE_KEY
const supabaseUrl = 'https://myjhnqgfwqtcicnvcwcj.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MTQxNTQ3MiwiZXhwIjoxOTU2OTkxNDcyfQ.gySR3Lv-m_CIj2Eyx6kfyOdwwMXEOFOgeHSjADqcM4Y'

const supabase = createClient(supabaseUrl, supabaseKey, {
	// auth: {
	// 	persistSession: false,
	// },
})

export default supabase
export {supabase}
