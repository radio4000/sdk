import {supabase} from './main.js'
import {readUser} from './users.js'

/**
 * @typedef {import('./types.d.ts').CreateTrackParams} CreateTrackParams
 * @typedef {import('./types.d.ts').UpdateTrackParams} UpdateTrackParams
 */

/**
 * Creates a track and connects it to a user and channel.
 * @param {string} channelId
 * @param {CreateTrackParams} fields
 */
export const createTrack = async (channelId, fields) => {
	const {url, title, description, discogs_url} = fields

	if (!channelId) throw Error('Missing channel id')

	// Create track
	const {data: track, error} = await supabase
		.from('tracks')
		.insert({url, title, description, discogs_url})
		.select()
		.single()
	if (error) return {error}

	// Create junction row
	const {data: user} = await readUser()
	const {error: error2} = await supabase
		.from('channel_track')
		.insert({
			track_id: track.id,
			channel_id: channelId,
			user_id: user.id
		})
		.single()
	if (error2) return {error}

	return {data: track}
}

/**
 * Updates a track
 * @param {string} id
 * @param {UpdateTrackParams} changes
 */
export const updateTrack = async (id, changes) => {
	const {url, title, description, discogs_url} = changes
	return supabase.from('tracks').update({url, title, description, discogs_url}).eq('id', id)
}

/**
 * Deletes a track
 * @param {string} id
 * @returns {Promise<Object>}
 */
export const deleteTrack = async (id) => {
	return supabase.from('tracks').delete().eq('id', id)
}

/**
 * Finds a track by id
 * @param {string} id
 */
export const readTrack = async (id) => {
	return supabase.from('channel_tracks').select('*').eq('id', id).single()
}

/**
 * Checks if current user can edit a track
 * @param {string} track_id
 * @returns {Promise<Boolean>}
 */
export async function canEditTrack(track_id) {
	const {data: user} = await readUser()
	if (!user) return false
	const {data} = await supabase
		.from('channel_track')
		.select('track_id, user_id')
		.match({user_id: user.id, track_id})
	if (data.length > 0) return true
	return false
}
