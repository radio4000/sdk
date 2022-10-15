import {supabase} from './supabase-client'

export const createChannel = async ({supabase, channel, user}) => {
	const {name, slug} = channel
	const {id: user_id} = user

	// Throw an error if the slug is in use by the old Firebase database.
	const queryFirebaseDb = await firebaseGetChannelBySlug(slug)
	const isSlugTaken = Object.keys(queryFirebaseDb).length > 0
	if (isSlugTaken) throw new Error('Sorry. This channel slug is already taken by someone else.')

	// Create channel
	const channelResponse = await supabase.from('channels').insert({name, slug}).single()

	// Stop if the first query failed.
	if (channelResponse.error) return channelResponse

	// Create junction table
	const channel_id = channelResponse.data.id
	const userChannelResponse = await supabase.from('user_channel').insert({user_id, channel_id}).single()
	if (userChannelResponse.error) return userChannelResponse

	// Return both records of the channel
	return {data: {channel: channelResponse.data, userChannel: userChannelResponse.data}}
}

export const updateChannel = async ({supabase, id, changes}) => {
	console.log('updating channel', id, changes)
	const {name, slug, description} = changes
	return supabase.from('channels').update({name, slug, description}).eq('id', id)
}

export const deleteChannel = async ({supabase, id}) => {
	if (!id) return
	console.log('deleting channel', id)
	return supabase.from('channels').delete().eq('id', id)
}

export const findChannelBySlug = async ({slug}) =>
	supabase.from('channels').select(`*`).eq('slug', slug).single()

export const findChannels = async ({limit}) =>
	supabase.from('channels').select('*').limit(limit).order('created_at', {ascending: true})

export async function firebaseGetChannelBySlug(slug) {
	const res = await fetch(`https://radio4000.firebaseio.com/channels.json?orderBy="slug"&equalTo="${slug}"`)
	return await res.json()
}