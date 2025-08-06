import * as auth from './auth.js'
import * as users from './users.js'
import * as channels from './channels.js'
import * as tracks from './tracks.js'
import * as browse from './browse.js'

/** @typedef {import('@supabase/supabase-js').SupabaseClient<import('./database.types.js').Database>} SupabaseClient */

/** @type {SupabaseClient} */
export let supabase

/** @typedef {Object} SDK
 * @property {typeof auth} auth
 * @property {typeof users} users
 * @property {typeof channels} channels
 * @property {typeof tracks} tracks
 * @property {SupabaseClient} supabase
 * @property {Object} browse
 */

/**
 * Creates a new SDK instance with the given Supabase client.
 * @param {SupabaseClient} supabaseClient
 * @returns {SDK}
 */
export function createSdk(supabaseClient) {
	if (!supabaseClient) throw Error('Pass in a Supabase client')

	supabase = supabaseClient

	return {
		auth,
		users,
		channels,
		tracks,
		supabase,
		browse,
	}
}
