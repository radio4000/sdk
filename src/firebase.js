import {v5 as uuidv5} from 'uuid'
import {extractTokens} from './utils.js'

/** @typedef {import('./types.ts').FirebaseChannelResult} FirebaseChannelResult */

const firebaseHost = 'https://radio4000.firebaseio.com'

// Deterministic namespace for converting Firebase IDs to UUIDs
const R4_NAMESPACE = uuidv5('r4_firebase_random_ids', uuidv5.DNS)

/**
 * Find a Firebase channel by "slug" property
 * @param {string} slug
 * @returns {Promise<FirebaseChannelResult>}
 */
export async function readChannel(slug) {
	const res = await fetch(`${firebaseHost}/channels.json?orderBy="slug"&equalTo="${slug}"`)
	const json = await res.json()
	if (json.error) return {error: {message: json.error}}

	const entries = Object.entries(json || {})
	if (!entries.length) return {data: null}
	const [firebaseId, channelData] = entries[0]

	return {data: {...channelData, id: firebaseId}}
}

/**
 * Read all Firebase channels (useful for migration)
 * Note: Firebase REST API doesn't support server-side pagination, so this fetches all channels
 * @param {Object} [options]
 * @param {number} [options.limit] - Client-side limit on number of channels returned
 * @returns {Promise<{data?: Array, error?: Object}>}
 */
export async function readChannels({limit} = {}) {
	const res = await fetch(`${firebaseHost}/channels.json`)
	const json = await res.json()
	if (json?.error) return {error: {message: json.error}}

	const channels = Object.entries(json || {})
		.map(([id, channel]) => ({...channel, id}))
		.sort((a, b) => (a.created || 0) - (b.created || 0))

	return {data: limit ? channels.slice(0, limit) : channels}
}

/**
 * Find Firebase tracks by either firebase channel ID or slug
 * @param {Object} params
 * @param {string} [params.channelId] - Firebase channel ID
 * @param {string} [params.slug] - Channel slug
 * @returns {Promise<{data?: Array, error?: Object}>}
 */
export async function readTracks({channelId, slug}) {
	// If slug provided, fetch channel first to get Firebase ID
	if (slug && !channelId) {
		const {data: channel, error} = await readChannel(slug)
		if (error) return {error}
		if (!channel) return {data: []}
		channelId = channel.id
	}

	if (!channelId) return {error: {message: 'Either slug or channelId is required'}}

	const url = `${firebaseHost}/tracks.json?orderBy="channel"&startAt="${channelId}"&endAt="${channelId}"`
	const res = await fetch(url)
	const json = await res.json()
	if (json?.error) return {error: {message: json.error}}

	// Convert object to array, preserving firebase track IDs
	const tracks = Object.entries(json || {})
		.map(([id, track]) => ({...track, id}))
		.sort((a, b) => (a.created || 0) - (b.created || 0))

	return {data: tracks}
}

/**
 * Parse a Firebase v1 channel into v2 schema
 * @param {Object} firebaseChannel - Raw Firebase channel with {id, title, body, created, updated, slug, ...}
 * @returns {Object} v2 channel with {id: UUID, firebase_id, name, description, created_at, updated_at, source: 'v1', ...}
 */
export function parseChannel(firebaseChannel) {
	const updatedAt = new Date(
		firebaseChannel.updated ||
			firebaseChannel.updated_at ||
			firebaseChannel.created ||
			firebaseChannel.created_at
	).toISOString()

	return {
		id: uuidv5(firebaseChannel.id, R4_NAMESPACE),
		firebase_id: firebaseChannel.id,
		slug: firebaseChannel.slug,
		name: firebaseChannel.title || firebaseChannel.name || '', // Firebase uses 'title'
		description: firebaseChannel.body || firebaseChannel.description || '',
		url: firebaseChannel.url || '',
		image: firebaseChannel.image || '',
		latitude: firebaseChannel.coordinatesLatitude || firebaseChannel.latitude,
		longitude: firebaseChannel.coordinatesLongitude || firebaseChannel.longitude,
		track_count: firebaseChannel.track_count || 0,
		source: 'v1',
		created_at: new Date(firebaseChannel.created || firebaseChannel.created_at).toISOString(),
		updated_at: updatedAt,
		latest_track_at: updatedAt // In Firebase, channel.updated reflects last track added
	}
}

/**
 * Parse a Firebase v1 track into v2 schema with tag/mention extraction
 * @param {Object} firebaseTrack - raw Firebase track with {id, url, title, body, created, ...}
 * @param {string} channelId - v2 channel UUID
 * @param {string} channelSlug - v2 channel slug
 * @returns {Object} v2 track with {firebase_id, channel_id, url, title, description, discogs_url, tags, mentions, source: 'v1', ...}
 */
export function parseTrack(firebaseTrack, channelId, channelSlug) {
	const {mentions, tags} = extractTokens(firebaseTrack.body || firebaseTrack.description)

	return {
		id: uuidv5(firebaseTrack.id, R4_NAMESPACE),
		firebase_id: firebaseTrack.id,
		channel_id: channelId,
		slug: channelSlug,
		url: firebaseTrack.url,
		title: firebaseTrack.title,
		description: firebaseTrack.body || firebaseTrack.description || '',
		discogs_url: firebaseTrack.discogsUrl || firebaseTrack.discogs_url || '',
		source: 'v1',
		tags: tags.length > 0 ? tags : null,
		mentions: mentions.length > 0 ? mentions : null,
		created_at: new Date(firebaseTrack.created || firebaseTrack.created_at).toISOString(),
		updated_at: new Date(
			firebaseTrack.updated ||
				firebaseTrack.updated_at ||
				firebaseTrack.created ||
				firebaseTrack.created_at
		).toISOString()
	}
}
