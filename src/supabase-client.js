import {createClient} from '@supabase/supabase-js'

// const SUPABASE_URL = process.ENV.SUPABASE_URL
// const	SUPABASE_ANON_KEY = process.ENV.SUPABASE_ANON_KEY

export const SUPABASE_URL = 'https://myjhnqgfwqtcicnvcwcj.supabase.co'
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MTQxNTQ3MiwiZXhwIjoxOTU2OTkxNDcyfQ.gySR3Lv-m_CIj2Eyx6kfyOdwwMXEOFOgeHSjADqcM4Y'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

export default supabase
export {supabase}
