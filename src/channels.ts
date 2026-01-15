import * as firebase from './firebase.js'
import {supabase} from './create-sdk.js'
import {readUser} from './users.js'
import type {
	CreateChannelParams,
	UpdateChannelParams,
	Channel,
	ChannelRow,
	Track,
	SdkResult
} from './types'

/**
 * Creates a new radio channel and connects it to a user
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
}: CreateChannelParams): Promise<SdkResult<ChannelRow>> => {
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
	let resolvedUserId = userId
	if (!resolvedUserId) {
		const {data} = await readUser()
		resolvedUserId = data?.id
	}

	if (!resolvedUserId) {
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
		.insert({user_id: resolvedUserId, channel_id: channel.id})
		.single()
	if (userChannelError) return {data: null, error: userChannelError}

	// Return the channel
	return {data: channel as ChannelRow, error: null}
}

/**
 * Updates a channel
 */
export const updateChannel = async (
	id: string,
	changes: UpdateChannelParams
): Promise<SdkResult<ChannelRow>> => {
	// Extract the keys so we're sure which fields update.
	const {name, slug, description, url, image, longitude, latitude} = changes
	const {data, error} = await supabase
		.from('channels')
		.update({name, slug, description, url, image, longitude, latitude})
		.eq('id', id)
		.select()
		.single()

	if (error) return {data: null, error}
	return {data: data as ChannelRow, error: null}
}

/**
 * Deletes a channel
 */
export const deleteChannel = async (id: string): Promise<SdkResult<null>> => {
	if (!id) return {data: null, error: {message: 'Missing ID to delete channel'}}
	const {error} = await supabase.from('channels').delete().eq('id', id)
	if (error) return {data: null, error}
	return {data: null, error: null}
}

/**
 * Finds a channel by slug
 * the "channels_with_tracks" is a view that contains a few extra, useful fields
 */
export const readChannel = async (slug: string): Promise<SdkResult<Channel>> => {
	const {data, error} = await supabase
		.from('channels_with_tracks')
		.select('*')
		.eq('slug', slug)
		.single()
	if (error) return {data: null, error}
	return {data: data as Channel, error: null}
}

/**
 * Returns a list of channels.
 */
export const readChannels = async (limit = 1000): Promise<SdkResult<Channel[]>> => {
	const {data, error} = await supabase
		.from('channels_with_tracks')
		.select('*')
		.limit(limit)
		.order('created_at', {ascending: true})
	if (error) return {data: null, error}
	return {data: data as Channel[], error: null}
}

/**
 * Lists all channels from current user
 */
export const readUserChannels = async (): Promise<SdkResult<ChannelRow[]>> => {
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
	return {data: channels as ChannelRow[], error: null}
}

/**
 * Fetches tracks by channel slug
 */
export async function readChannelTracks(slug: string, limit = 5000): Promise<SdkResult<Track[]>> {
	if (!slug) return {data: null, error: {message: 'Missing channel slug'}}
	const {data, error} = await supabase
		.from('channel_tracks')
		.select('*')
		.eq('slug', slug)
		.order('created_at', {ascending: false})
		.limit(limit)

	if (error) return {data: null, error}
	return {data: data as Track[], error: null}
}

/**
 * Checks if the local session user can edit a channel
 */
export async function canEditChannel(slug: string): Promise<boolean> {
	const {
		data: {session}
	} = await supabase.auth.getSession()
	if (!session?.user) return false
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
 */
export async function createImage(file: string, tags?: string): Promise<Response> {
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
 */
export const followChannel = async (
	followerId: string,
	channelId: string
): Promise<SdkResult<null>> => {
	const {error} = await supabase
		.from('followers')
		.insert([{follower_id: followerId, channel_id: channelId}])
	if (error) return {data: null, error}
	return {data: null, error: null}
}

/**
 * Make a channel unfollow another channel
 */
export const unfollowChannel = async (
	followerId: string,
	channelId: string
): Promise<SdkResult<null>> => {
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
 */
export const readFollowers = async (channelId: string): Promise<SdkResult<ChannelRow[]>> => {
	const {data, error} = await supabase
		.from('followers')
		.select(`channels!follower_id (*)`)
		.eq('channel_id', channelId)

	if (error) return {data: null, error}
	// Filter out any potential nulls from the join
	const channels: ChannelRow[] = data.flatMap((item) => (item.channels ? [item.channels] : []))
	return {data: channels, error: null}
}

/**
 * Get a list of channels that a specific channel follows
 */
export const readFollowings = async (channelId: string): Promise<SdkResult<ChannelRow[]>> => {
	const {data, error} = await supabase
		.from('followers')
		.select(`channels!channel_id (*)`)
		.eq('follower_id', channelId)

	if (error) return {data: null, error}
	// Filter out any potential nulls from the join
	const channels: ChannelRow[] = data.flatMap((item) => (item.channels ? [item.channels] : []))
	return {data: channels, error: null}
}
