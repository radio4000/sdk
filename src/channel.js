import {supabase} from './supabase-client.js'
import {getUser} from './user.js'

/**
 * A channel
 * @typedef {Object} Channel
 * @property {string} name
 * @property {string} slug - unique
 * @property {string} [description]
 */

/**
 * Creates a new radio channel and connects it to a user
 * @param {Channel} fields
 * @return {Promise<object>} {data, error}
 */
export const createChannel = async ({name, slug}) => {
	const user = await getUser()

	// Throw an error if the slug is in use by the old Firebase database.
	const queryFirebaseDb = await findFirebaseChannelBySlug(slug)
	const isSlugTaken = Object.keys(queryFirebaseDb).length > 0
	if (isSlugTaken) return {
		code: 'slug-exists-firebase',
		error: Error('Sorry. This channel slug is already taken by someone else.')
	}

	// Create channel
	const channelRes = await supabase.from('channels').insert({name, slug}).single().select()

	// Stop if the first query failed.
	if (channelRes.error) return channelRes

	// Create junction table
	const channel_id = channelRes.data.id
	const userChannelRes = await supabase.from('user_channel').insert({user_id: user.id, channel_id}).single()
	if (userChannelRes.error) return userChannelRes

	// Return both records of the channel
	return {data: channelRes.data}
}

/**
 * Updates a channel
 * @param {string} id
 * @param {object} changes - optional fields to update
 * @param {string} [changes.name]
 * @param {string} [changes.slug]
 * @param {string} [changes.description]
 * @returns {Promise<object>}
 */
export const updateChannel = async (id, changes) => {
	const {name, slug, description} = changes
	return supabase.from('channels').update({name, slug, description}).eq('id', id)
}

/**
 * Deletes a channel
 * @param {string} id
 * @returns void
 */
export const deleteChannel = async (id) => {
	if (!id) return
	return supabase.from('channels').delete().eq('id', id)
}

export const findChannelBySlug = async (slug) => {
	return supabase.from('channels').select(`*`).eq('slug', slug).single()
}

/**
 * Returns a list of channels.
 * @param {number} limit
 * @returns {Promise<object>}
 */
export const findChannels = async (limit = 1000) => {
	return supabase.from('channels').select('*').limit(limit).order('created_at', {ascending: true})
}

export async function findFirebaseChannelBySlug(slug) {
	const res = await fetch(`https://radio4000.firebaseio.com/channels.json?orderBy="slug"&equalTo="${slug}"`)
	const json = await res.json()
	// Since we only expect a single record, we can do this.
	return {data: Object.values(json)[0]}
}

export const findUserChannels = async () => {
	const user = await getUser()

	if (user) {
		return await supabase
			.from('channels')
			.select('*, user_channel!inner(user_id)')
			.eq('user_channel.user_id', user.id)
			.order('updated_at', { ascending: true })
	} else {
		return []
	}
}

export async function findChannelTracks(channelId) {
	if (!channelId) throw Error('Missing channel id')
	const res = await supabase
		.from('channel_track')
		.select('id:track_id, created_at, track_id(url, title, description, tags)')
		.limit(3000)
		.eq('channel_id', channelId)
		.order('created_at', { ascending: false })
	if (res.data) {
		res.data = serializeAllTracks(res.data)
	}
	return res
}


// Because of the nested query we get a track like this:
// {id, track_id: {title, url...}}
// This flattens it back.
function serializeAllTracks(tracks) {
	return tracks.map((track) => {
		track.url = track.track_id.url
		track.title = track.track_id.title
		track.description = track.track_id.description
		track.tags = track.track_id.tags
		delete track.track_id
		return track
	})
}
