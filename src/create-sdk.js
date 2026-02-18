import * as auth from './auth.js'
import * as browse from './browse.js'
import * as channels from './channels.js'
import * as search from './search.js'
import * as tracks from './tracks.js'
import * as users from './users.js'

/** @typedef {import('@supabase/supabase-js').SupabaseClient<import('./database.types.ts').Database>} SupabaseClient */

/** @type {SupabaseClient} */
export let supabase

/** @typedef {Object} SDK
 * @property {typeof auth} auth
 * @property {typeof users} users
 * @property {typeof channels} channels
 * @property {typeof tracks} tracks
 * @property {typeof search} search
 * @property {SupabaseClient} supabase
 * @property {typeof browse} browse
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
		search,
		supabase,
		browse
	}
}
