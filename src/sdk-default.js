import {createClient} from '@supabase/supabase-js'
// const {createClient} = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
import {createSdk} from './create-sdk.js'

const supabase = createClient(
	'https://myjhnqgfwqtcicnvcwcj.supabase.co',
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MTQxNTQ3MiwiZXhwIjoxOTU2OTkxNDcyfQ.gySR3Lv-m_CIj2Eyx6kfyOdwwMXEOFOgeHSjADqcM4Y'
)

const sdk = createSdk(supabase)

export default sdk
