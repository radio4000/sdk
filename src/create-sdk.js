import * as auth from './auth.js'
import * as browse from './browse.js'
import * as channels from './channels.js'
import * as firebase from './firebase.js'
import * as search from './search.js'
import * as tracks from './tracks.js'
import * as users from './users.js'
import {createAdapter} from './adapters/index.js'

/** @typedef {import('@supabase/supabase-js').SupabaseClient<import('./database.types.js').Database>} SupabaseClient */
/** @typedef {import('./adapters/interface.js').ClientAdapter} ClientAdapter */

/** @type {SupabaseClient | ClientAdapter} */
export let supabase

/** @typedef {Object} SDK
 * @property {typeof auth} auth
 * @property {typeof users} users
 * @property {typeof channels} channels
 * @property {typeof tracks} tracks
 * @property {typeof search} search
 * @property {typeof firebase} firebase
 * @property {SupabaseClient | ClientAdapter} supabase
 * @property {Object} browse
 */

/**
 * Creates a new SDK instance with the given client.
 * Supports multiple backends via adapters.
 *
 * @param {SupabaseClient | ClientAdapter} client - Supabase client or adapter
 * @param {Object} [options] - Additional options
 * @param {'supabase' | 'browser'} [options.adapter] - Adapter type (if client is not already an adapter)
 * @returns {SDK}
 *
 * @example
 * // Traditional Supabase usage (backward compatible)
 * import {createClient} from '@supabase/supabase-js'
 * const supabase = createClient(url, key)
 * const sdk = createSdk(supabase)
 *
 * @example
 * // Using browser storage adapter
 * import {createSdk} from '@radio4000/sdk'
 * const sdk = createSdk({}, {adapter: 'browser'})
 *
 * @example
 * // Using adapter directly
 * import {BrowserStorageAdapter} from '@radio4000/sdk/adapters'
 * const adapter = new BrowserStorageAdapter({prefix: 'myapp'})
 * const sdk = createSdk(adapter)
 */
export function createSdk(client, options = {}) {
	if (!client) throw Error('Pass in a client or adapter')

	// If client is already an adapter, use it directly
	// Otherwise, wrap it in an adapter based on options.adapter type
	const adapter = client.type
		? client
		: createAdapter(options.adapter || 'supabase', client)

	supabase = adapter

	return {
		auth,
		users,
		channels,
		tracks,
		search,
		firebase,
		supabase,
		browse
	}
}
