import * as auth from './auth.js'
import * as users from './users.js'
import * as channels from './channels.js'
import * as tracks from './tracks.js'

export let supabase

export function createSdk(supabaseClient) {
	if (!supabaseClient) throw Error('Pass in a Supabase client')

	supabase = supabaseClient

	return {
		auth,
		users,
		channels,
		tracks,
		supabase,
	}
}

/*
import {createClient} from '@supabase/supabase-js'
const supabaseClient = createClient(
	'https://myjhnqgfwqtcicnvcwcj.supabase.co',
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MTQxNTQ3MiwiZXhwIjoxOTU2OTkxNDcyfQ.gySR3Lv-m_CIj2Eyx6kfyOdwwMXEOFOgeHSjADqcM4Y'
)
const defaultSdk = createSdk(supabaseClient)
export default defaultSdk
*/
