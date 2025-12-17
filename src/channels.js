import * as firebase from './firebase.js'
import {supabase} from './create-sdk.js'
import {readUser} from './users.js'

/**
 * @typedef {import('./types').CreateChannelParams} CreateChannelParams
 * @typedef {import('./types').UpdateChannelParams} UpdateChannelParams
 * @typedef {import('./types').Channel} Channel
 * @typedef {import('./types').ChannelRow} ChannelRow
 * @typedef {import('./types').Track} Track
 */

/**
 * @template T
 * @typedef {import('./types').SdkResult<T>} SdkResult
 */

/**
 * Creates a new radio channel and connects it to a user
 * @param {CreateChannelParams} fields
 * @returns {Promise<SdkResult<ChannelRow>>}
 */
export const createChannel = async ({
	id,
	name,
	slug,
	userId,
	description,
	url,
	latitude,
	longitude
}) => {
	// Throw an error if the slug is in use by the old Firebase database.
	const {data: isSlugTaken} = await firebase.readChannel(slug)
	if (isSlugTaken) {
		return {
			data: null,
			error: {
				code: 'slug-exists-firebase',
				message: 'Sorry. This channel slug is already taken by someone else.'
			}
		}
	}

	// If we don't have a user, try to read it from the current session.
	if (!userId) {
		const {data} = await readUser()
		userId = data?.id
	}

	if (!userId) {
		return {
			data: null,
			error: {
				code: 'user-required',
				message: 'A user is required to create a new channel'
			}
		}
	}

	// Create channel (id is optional - if provided, uses client UUID; otherwise Postgres generates one)
	const {data: channel, error: channelError} = await supabase
		.from('channels')
		.insert({id, name, slug, description, url, latitude, longitude})
		.select()
		.single()

	// Stop if the first query failed.
	if (channelError) return {data: null, error: channelError}

	// Create junction table
	const {error: userChannelError} = await supabase
		.from('user_channel')
		.insert({user_id: userId, channel_id: channel.id})
		.single()
	if (userChannelError) return {data: null, error: userChannelError}

	// Return the channel
	return {data: channel, error: null}
}

/**
 * Updates a channel
 * @param {string} id
 * @param {UpdateChannelParams} changes - optional fields to update
 * @returns {Promise<SdkResult<ChannelRow>>}
 */
export const updateChannel = async (id, changes) => {
	// Extract the keys so we're sure which fields update.
	const {name, slug, description, url, image, longitude, latitude} = changes
	const {data, error} = await supabase
		.from('channels')
		.update({name, slug, description, url, image, longitude, latitude})
		.eq('id', id)
		.select()
		.single()

	if (error) return {data: null, error}
	return {data, error: null}
}

/**
 * Deletes a channel
 * @param {string} id
 * @returns {Promise<SdkResult<null>>}
 */
export const deleteChannel = async (id) => {
	if (!id) return {data: null, error: {message: 'Missing ID to delete channel'}}
	const {error} = await supabase.from('channels').delete().eq('id', id)
	if (error) return {data: null, error}
	return {data: null, error: null}
}

/**
 * Finds a channel by slug
 * the "channels_with_tracks" is a view that contains a few extra, useful fields
 * @param {string} slug
 * @returns {Promise<SdkResult<Channel>>}
 */
export const readChannel = async (slug) => {
	const {data, error} = await supabase
		.from('channels_with_tracks')
		.select('*')
		.eq('slug', slug)
		.single()
	if (error) return {data: null, error}
	return {data, error: null}
}

/**
 * Returns a list of channels.
 * @param {number} limit
 * @returns {Promise<SdkResult<Channel[]>>}
 */
export const readChannels = async (limit = 1000) => {
	const {data, error} = await supabase
		.from('channels_with_tracks')
		.select('*')
		.limit(limit)
		.order('created_at', {ascending: true})
	if (error) return {data: null, error}
	return {data, error: null}
}

/** Lists all channels from current user
 * @returns {Promise<SdkResult<ChannelRow[]>>}
 */
export const readUserChannels = async () => {
	const {data: user} = await readUser()
	if (!user) return {data: null, error: {message: 'User not found'}}

	const {data, error} = await supabase
		.from('channels')
		.select('*, user_channel!inner(user_id)')
		.eq('user_channel.user_id', user.id)
		.order('updated_at', {ascending: true})

	if (error) return {data: null, error}
	// Strip the user_channel join data to return clean ChannelRow objects
	const channels = data.map(({user_channel, ...channel}) => channel)
	return {data: channels, error: null}
}

/**
 * Fetches tracks by channel slug
 * @param {string} slug
 * @param {number} limit - default 5000
 * @returns {Promise<SdkResult<Track[]>>}
 */
export async function readChannelTracks(slug, limit = 5000) {
	if (!slug) return {data: null, error: {message: 'Missing channel slug'}}
	const {data, error} = await supabase
		.from('channel_tracks')
		.select('*')
		.eq('slug', slug)
		.order('created_at', {ascending: false})
		.limit(limit)

	if (error) return {data: null, error}
	return {data, error: null}
}

/**
 * Checks if the local session user can edit a channel
 * @param {string} slug
 * @returns {Promise<boolean>}
 */
export async function canEditChannel(slug) {
	const {
		data: {session}
	} = await supabase.auth.getSession()
	if (!session?.user) return false
	// const {data: user} = await readUser()
	const {data} = await supabase
		.from('user_channel')
		.select('user_id, channel_id!inner ( name, slug )')
		.eq('channel_id.slug', slug)
		.eq('user_id', session.user.id)
	if (data && data.length > 0) return true
	return false
}

/**
 * Uploads an image file to Cloudinary
 * @param {string} file
 * @param {string} [tags]
 * @returns {Promise<Response>}
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
		body: formData
	})
}

/**
 * Make a channel follow another channel
 * @param {string} followerId - ID of the channel following another channel
 * @param {string} channelId - ID of the channel being followed
 * @returns {Promise<SdkResult<null>>}
 */
export const followChannel = async (followerId, channelId) => {
	const {error} = await supabase
		.from('followers')
		.insert([{follower_id: followerId, channel_id: channelId}])
	if (error) return {data: null, error}
	return {data: null, error: null}
}

/**
 * Make a channel unfollow another channel
 * @param {string} followerId - ID of the channel unfollowing another channel
 * @param {string} channelId - ID of the channel being unfollowed
 * @returns {Promise<SdkResult<null>>}
 */
export const unfollowChannel = async (followerId, channelId) => {
	const {error} = await supabase
		.from('followers')
		.delete()
		.eq('follower_id', followerId)
		.eq('channel_id', channelId)
	if (error) return {data: null, error}
	return {data: null, error: null}
}

/**
 * Get a list of channels following a specific channel
 * @param {string} channelId - ID of the channel to get the list of followers
 * @returns {Promise<SdkResult<ChannelRow[]>>}
 */
export const readFollowers = async (channelId) => {
	const {data, error} = await supabase
		.from('followers')
		.select(`channels!follower_id (*)`)
		.eq('channel_id', channelId)

	if (error) return {data: null, error}
	// Filter out any potential nulls from the join
	const channels = data.flatMap((item) => (item.channels ? [item.channels] : []))
	return {data: channels, error: null}
}

/**
 * Get a list of channels that a specific channel follows
 * @param {string} channelId - ID of the channel to get the list of followed channels
 * @returns {Promise<SdkResult<ChannelRow[]>>}
 */
export const readFollowings = async (channelId) => {
	const {data, error} = await supabase
		.from('followers')
		.select(`channels!channel_id (*)`)
		.eq('follower_id', channelId)

	if (error) return {data: null, error}
	// Filter out any potential nulls from the join
	const channels = data.flatMap((item) => (item.channels ? [item.channels] : []))
	return {data: channels, error: null}
}
