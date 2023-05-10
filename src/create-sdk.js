import * as auth from './auth.js'
import * as users from './users.js'
import * as channels from './channels.js'
import * as tracks from './tracks.js'
import { SupabaseClient } from '@supabase/supabase-js'

export let supabase

/** @typedef {Object} SDK
 * @property {typeof auth} auth
 * @property {typeof users} users
 * @property {typeof channels} channels
 * @property {typeof tracks} tracks
 * @property {SupabaseClient} supabase

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
	}
}
