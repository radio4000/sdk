import {supabase} from './supabase-client.js'

export const createTrack = async ({changes, channelId, userId}) => {
	const {url, title, description} = changes

	if (!channelId) throw Error('Missing channel id')

	// Create track
	const {data: track, error} = await supabase
		.from('tracks')
		.insert({url, title, description})
		.single()
	if (error) return {error}

	// Create junction row
	const {error2} = await supabase
		.from('channel_track')
		.insert({
			track_id: track.id,
			channel_id: channelId,
			user_id: userId,
		})
		.single()
	if (error2) return {error}

	return {data: track}
}

export const updateTrack = async ({id, changes}) => {
	const {url, title, description} = changes
	return supabase.from('tracks').update({url, title, description}).eq('id', id)
}

export const deleteTrack = async ({track}) => {
	if (!track.id) return
	return supabase.from('tracks').delete().eq('id', track.id)
}
