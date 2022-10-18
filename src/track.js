import {supabase} from './supabase-client.js'
import {getUser} from './user.js'

/**
 * Creates a track and connects it to a user and channel.
 * @param {string} channelId
 * @param {object} fields
 * @param {string} fields.url
 * @param {string} fields.title
 * @param {string} [fields.description]
 * @return {Promise}
 */
export const createTrack = async (channelId, fields) => {
	const {url, title, description} = fields

	if (!channelId) throw Error('Missing channel id')

	// Create track
	const {data: track, error} = await supabase
		.from('tracks')
		.insert({url, title, description})
		.single()
		.select()
	if (error) return {error}

	// Create junction row
	const user = await getUser()
	const {error2} = await supabase
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
 * @param {object} changes
 * @returns {Promise}
 */
export const updateTrack = async (id, changes) => {
	const {url, title, description} = changes
	return supabase.from('tracks').update({url, title, description}).eq('id', id)
}

/**
 * Deletes a track
 * @param {string} id
 */
export const deleteTrack = async (id) => {
	if (!id) return
	return supabase.from('tracks').delete().eq('id', id)
}
