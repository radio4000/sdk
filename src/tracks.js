import {supabase} from './create-sdk.js'
import {readUser} from './users.js'

/**
 * @typedef {import('./types').CreateTrackParams} CreateTrackParams
 * @typedef {import('./types').UpdateTrackParams} UpdateTrackParams
 * @typedef {import('./types').TrackRow} TrackRow
 * @typedef {import('./types').Track} Track
 */

/**
 * @template T
 * @typedef {import('./types').SdkResult<T>} SdkResult
 */

/**
 * Creates a track and connects it to a user and channel.
 * @param {string} channelId
 * @param {CreateTrackParams} fields
 * @returns {Promise<SdkResult<TrackRow>>}
 */
export const createTrack = async (channelId, fields) => {
	const {id, url, title, description, discogs_url} = fields

	if (!channelId) throw Error('Missing channel id')

	// Create track (id is optional - if provided, uses client UUID; otherwise Postgres generates one)
	const {data: track, error} = await supabase
		.from('tracks')
		.insert({id, url, title, description, discogs_url})
		.select()
		.single()
	if (error) return {data: null, error}

	// Create junction row
	const {data: user} = await readUser()
	if (!user) return {data: null, error: {message: 'User not found'}}
	const {error: error2} = await supabase
		.from('channel_track')
		.insert({
			track_id: track.id,
			channel_id: channelId,
			user_id: user.id
		})
		.single()
	if (error2) return {data: null, error: error2}

	return {data: track, error: null}
}

/**
 * Updates a track
 * @param {string} id
 * @param {UpdateTrackParams} changes
 * @returns {Promise<SdkResult<TrackRow>>}
 */
export const updateTrack = async (id, changes) => {
	const {url, title, description, discogs_url, playback_error, duration} = changes
	const {data, error} = await supabase
		.from('tracks')
		.update({url, title, description, discogs_url, playback_error, duration})
		.eq('id', id)
		.select()
		.single()

	if (error) return {data: null, error}
	return {data, error: null}
}

/**
 * Deletes a track
 * @param {string} id
 * @returns {Promise<SdkResult<null>>}
 */
export const deleteTrack = async (id) => {
	const {error} = await supabase.from('tracks').delete().eq('id', id)
	if (error) return {data: null, error}
	return {data: null, error: null}
}

/**
 * Finds a track by id
 * @param {string} id
 * @returns {Promise<SdkResult<Track>>}
 */
export const readTrack = async (id) => {
	const {data, error} = await supabase.from('channel_tracks').select('*').eq('id', id).single()
	if (error) return {data: null, error}
	return {data, error: null}
}

/**
 * Checks if current user can edit a track
 * @param {string} track_id
 * @returns {Promise<boolean>}
 */
export async function canEditTrack(track_id) {
	const {data: user} = await readUser()
	if (!user) return false
	const {data} = await supabase
		.from('channel_track')
		.select('track_id, user_id')
		.match({user_id: user.id, track_id})
	if (data && data.length > 0) return true
	return false
}
