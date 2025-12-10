import {supabase} from './create-sdk.js'

/**
 * @typedef {import('./types').Channel} Channel
 * @typedef {import('./types').Track} Track
 */

/**
 * @template T
 * @typedef {import('./types').SdkResult<T>} SdkResult
 */

/**
 * Search channels by query using full-text search
 * @param {string} query
 * @param {{limit?: number}} [options]
 * @returns {Promise<SdkResult<Channel[]>>}
 */
export async function searchChannels(query, {limit = 100} = {}) {
	if (!query || query.trim().length === 0) {
		return {data: [], error: null}
	}
	return supabase
		.from('channels_with_tracks')
		.select('*')
		.textSearch('fts', `${query}:*`)
		.limit(limit)
}

/**
 * Search tracks by query using full-text search
 * @param {string} query
 * @param {{limit?: number}} [options]
 * @returns {Promise<SdkResult<Track[]>>}
 */
export async function searchTracks(query, {limit = 100} = {}) {
	if (!query || query.trim().length === 0) {
		return {data: [], error: null}
	}
	return supabase.from('channel_tracks').select('*').textSearch('fts', `${query}:*`).limit(limit)
}

/**
 * Search both channels and tracks
 * @param {string} query
 * @param {{limit?: number}} [options]
 * @returns {Promise<SdkResult<{channels: Channel[], tracks: Track[]}>>}
 */
export async function searchAll(query, options = {}) {
	if (!query || query.trim().length === 0) {
		return {data: {channels: [], tracks: []}, error: null}
	}

	const [channelsRes, tracksRes] = await Promise.all([
		searchChannels(query, options),
		searchTracks(query, options)
	])

	if (channelsRes.error) return {data: null, error: channelsRes.error}
	if (tracksRes.error) return {data: null, error: tracksRes.error}

	return {
		data: {
			channels: channelsRes.data ?? [],
			tracks: tracksRes.data ?? []
		},
		error: null
	}
}
