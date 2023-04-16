import * as auth from './auth.js'
import * as users from './users.js'
import * as channels from './channels.js'
import * as tracks from './tracks.js'

/**
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
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
