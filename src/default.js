// Importing from a CDN since we want it to work without build.
// import {createClient} from '@supabase/supabase-js'
//
import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

import {createSdk} from './index.js'

const supabaseClient = createClient(
	'https://myjhnqgfwqtcicnvcwcj.supabase.co',
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MTQxNTQ3MiwiZXhwIjoxOTU2OTkxNDcyfQ.gySR3Lv-m_CIj2Eyx6kfyOdwwMXEOFOgeHSjADqcM4Y'
)

const sdk = createSdk(supabaseClient)

export default sdk
