import {supabase} from './supabase-client.js'
import {getUser} from './user.js'

/**
 * A track
 * @typedef {Object} Track
 * @property {string} url
 * @property {string} title
 * @property {string} [description]
 */

/**
 * Creates a track and connects it to a user and channel.
 * @param {string} channelId
 * @param {Track} fields
 * @return {Promise<import('./channel.js').ReturnObj>}
 */
export const createTrack = async (channelId, fields) => {
	const {url, title, description} = fields

	if (!channelId) throw Error('Missing channel id')

	// Create track
	const {data: track, error} = await supabase
		.from('tracks')
		.insert({url, title, description})
		.select()
		.single()
	if (error) return {error}

	// Create junction row
	const {data: user} = await getUser()
	const {error: error2} = await supabase
		.from('channel_track')
		.insert({
			track_id: track.id,
			channel_id: channelId,
			user_id: user.id,
		})
		.single()
	if (error2) return {error}

	return {data: track}
}

/**
 * Updates a track
 * @param {string} id
 * @param {Track} changes
 * @return {Promise<import('./channel.js').ReturnObj>}
 */
export const updateTrack = async (id, changes) => {
	const {url, title, description} = changes
	return supabase.from('tracks').update({url, title, description}).eq('id', id)
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
 * @returns {Promise<{ data?: Track, error? }>}
 */
export const findTrack = async (id) => {
	return supabase.from('tracks').select('*').eq('id', id).single()
}

/**
 * Checks if current user can edit a track
 * @param {string} track_id
 * @returns {Promise<Boolean>}
 */
export async function canEditTrack(track_id) {
	const {data: user} = await getUser()
	if (!user) return false
	const {data} = await supabase.from('channel_track').select('track_id, user_id').match({user_id: user.id, track_id})
	if (data.length > 0) return true
	return false
}
