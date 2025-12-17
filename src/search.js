import {supabase} from './create-sdk.js'

/**
 * Search channels by query using full-text search
 * @param {string} query - search query
 * @param {object} [options] - search options
 * @param {number} [options.limit=100] - maximum number of results
 * @returns {Promise<{data: Array|null, error: object|null}>}
 */
export async function searchChannels(query, {limit = 100} = {}) {
	if (!query || query.trim().length === 0) {
		return {data: [], error: null}
	}
	return supabase
		.from('channels_with_tracks')
		.select('*')
		.textSearch('fts', query, {type: 'websearch'})
		.limit(limit)
}

/**
 * Search tracks by query using full-text search
 * @param {string} query - search query
 * @param {object} [options] - search options
 * @param {number} [options.limit=100] - maximum number of results
 * @returns {Promise<{data: Array|null, error: object|null}>}
 */
export async function searchTracks(query, {limit = 100} = {}) {
	if (!query || query.trim().length === 0) {
		return {data: [], error: null}
	}
	return supabase
		.from('channel_tracks')
		.select('*')
		.textSearch('fts', query, {type: 'websearch'})
		.limit(limit)
}

/**
 * Search both channels and tracks
 * @param {string} query - search query
 * @param {object} [options] - search options
 * @param {number} [options.limit=100] - maximum number of results per type
 * @returns {Promise<{data: {channels: Array, tracks: Array}|null, error: object|null}>}
 */
export async function searchAll(query, options = {}) {
	if (!query || query.trim().length === 0) {
		return {data: {channels: [], tracks: []}, error: null}
	}

	const [channelsRes, tracksRes] = await Promise.all([
		searchChannels(query, options),
		searchTracks(query, options)
	])

	// If either failed, return the first error
	if (channelsRes.error) return {data: null, error: channelsRes.error}
	if (tracksRes.error) return {data: null, error: tracksRes.error}

	return {
		data: {
			channels: channelsRes.data,
			tracks: tracksRes.data
		},
		error: null
	}
}
