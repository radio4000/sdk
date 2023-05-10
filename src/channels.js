import {supabase} from './main.js'
import {readUser} from './users.js'

/**
 * A channel
 * @typedef {Object} Channel
 * @property {string} name
 * @property {string} slug - unique
 * @property {string} [userId] - if not passed in we try to read the current user
 * @property {string} [description]
 */

/**
 * This is the type all async functions should return.
 * @typedef {Object} ReturnObj
 * @property {object} [data]
 * @property {object} [error]
 * @property {string} [error.code]
 * @property {string} error.message
 */

/**
 * Creates a new radio channel and connects it to a user
 * @param {Channel} fields
 * @returns {Promise<ReturnObj>}
 */
export const createChannel = async ({name, slug, userId}) => {
	// Throw an error if the slug is in use by the old Firebase database.
	const {data: isSlugTaken} = await readFirebaseChannel(slug)
	if (isSlugTaken)
		return {
			error: {
				code: 'slug-exists-firebase',
				message: 'Sorry. This channel slug is already taken by someone else.',
			},
		}

	// If we don't have a user, try to read it from the current session.
	if (!userId) {
		const {data} = await readUser()
		userId = data.user.id
	}

	if (!userId) {
		return {
			error: {
				code: 'user-required',
				message: 'A user is required to create a new channel',
			},
		}
	}

	// Create channel
	const channelRes = await supabase.from('channels').insert({name, slug}).select().single()

	// Stop if the first query failed.
	if (channelRes.error) return channelRes

	// Create junction table
	const channel_id = channelRes.data.id
	const userChannelRes = await supabase.from('user_channel').insert({user_id: userId, channel_id}).single()
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
 * @param {string} [changes.url]
 * @param {number} [changes.longitude]
 * @param {number} [changes.latitude]
 * @returns {Promise<ReturnObj>}
 */
export const updateChannel = async (id, changes) => {
	// Extract the keys so we're sure which fields update.
	const {name, slug, description, url, longitude, latitude} = changes
	const response = await supabase.from('channels').update({name, slug, description, url, longitude, latitude}).eq('id', id)
	return response
}

/**
 * Deletes a channel
 * @param {string} id
 * @returns {Promise}
 */
export const deleteChannel = async (id) => {
	if (!id) return {error: {message: 'Missing ID to delete channel'}}
	return supabase.from('channels').delete().eq('id', id)
}

/**
 * Finds a channel by slug
 * @param {string} slug
 * @returns {Promise<ReturnObj>}
 */
export const readChannel = async (slug) => {
	return supabase.from('channels').select(`*`).eq('slug', slug).single()
}

/**
 * Returns a list of channels.
 * @param {number} limit
 * @returns {Promise<ReturnObj>}
 */
export const readChannels = async (limit = 1000) => {
	return supabase.from('channels').select('*').limit(limit).order('created_at', {ascending: true})
}

/**
 * Find a Firebase channel by "slug" property
 * @param {string} slug
 * @returns {Promise<ReturnObj>}
 */
export async function readFirebaseChannel(slug) {
	const res = await fetch(`https://radio4000.firebaseio.com/channels.json?orderBy="slug"&equalTo="${slug}"`)
	const json = await res.json()
	if (json.error) return {error: {message: json.error}}
	// Since we only expect a single record, we can do this.
	const channel = Object.values(json)[0] || null
	return {data: channel}
}

/** Lists all channels from current user */
export const readUserChannels = async () => {
	const {data: user} = await readUser()
	return supabase
		.from('channels')
		.select('*, user_channel!inner(user_id)')
		.eq('user_channel.user_id', user?.id)
		.order('updated_at', {ascending: true})
}

/**
 * Fetches tracks by channel slug
 * @param {string} slug
 * @returns {Promise<ReturnObj>}
 */
export async function readChannelTracks(slug) {
	if (!slug) return {error: {message: 'Missing channel slug'}}
	const {data, error} = await supabase
		.from('channel_track')
		.select(`
			channel_id!inner(
				slug
			),
			track_id(
				id, created_at, updated_at, title, url, description
			)
		`)
		.eq('channel_id.slug', slug)
		.order('created_at', {ascending: false})
		.limit(5000)
	const tracks = data.map((t) => t.track_id)
	return {data: tracks, error}
}

/**
 * Checks if current user can edit a channel
 * @param {string} slug
 * @returns {Promise<Boolean>}
 */
export async function canEditChannel(slug) {
	const {data: user} = await readUser()
	if (!user) return false
	const {data} = await supabase
		.from('user_channel')
		.select('user_id, channel_id!inner ( name, slug )')
		.eq('channel_id.slug', slug)
		.eq('user_id', user.id)
	if (data?.length > 0) return true
	return false
}

/**
 * Uploads an image file to Cloudinary
 * @param {string} file
 * @param {string} [tags]
 * @returns {Promise}
 */
export async function createImage(file, tags) {
	const cloudinaryCloudName = 'radio4000'
	const cloudinaryUploadPreset = 'tc44ivjo'

	const formData = new FormData()
	formData.append('upload_preset', cloudinaryUploadPreset)
	formData.append('file', file)
	if (tags) formData.append('tags', tags)

	return fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/auto/upload`, {
		method: 'POST',
		body: formData,
	})
}


/**
 * Make a channel follow another channel
 * @param {string} followerId - ID of the channel following another channel
 * @param {string} channelId - ID of the channel being followed
 * @returns {Promise<ReturnObj>}
 */
export const followChannel = async (followerId, channelId) => {
	const response = await supabase
		.from('followers')
		.insert([{ followerId, channelId }])
	return response;
};

/**
 * Make a channel unfollow another channel
 * @param {string} followerId - ID of the channel unfollowing another channel
 * @param {string} channelId - ID of the channel being unfollowed
 * @returns {Promise<ReturnObj>}
 */
export const unfollowChannel = async (followerId, channelId) => {
	const response = await supabase
		.from('followers')
		.delete()
		.eq('follower_id', followerId)
		.eq('channel_id', channelId);
	return response;
};

/**
 * Get a list of channels following a specific channel
 * @param {string} channelId - ID of the channel to get the list of followers
 * @returns {Promise<ReturnObj>}
 */
export const readFollowers = async (channelId) => {
	const select = `
		follower_id (
			id, name, slug, description, created_at, image, url
		)
	`
	const response = await supabase
		.from('followers')
		.select(select)
		.eq('channel_id', channelId);
	return response;
};

/**
 * Get a list of channels that a specific channel follows
 * @param {string} channelId - ID of the channel to get the list of followed channels
 * @returns {Promise<ReturnObj>}
 */
export const readFollowings = async (channelId) => {
	const select = `
		channel_id (
			id, name, slug, description, created_at, image, url
		)
	`
	const response = await supabase
		.from('followers')
		.select(select)
		.eq('follower_id', channelId);
	return response;
};
