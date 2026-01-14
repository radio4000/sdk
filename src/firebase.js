import {v5 as uuidv5} from 'uuid'
import {extractTokens} from './utils.js'

/**
 * @typedef {import('./types').FirebaseChannel} FirebaseChannel
 * @typedef {import('./types').FirebaseTrack} FirebaseTrack
 * @typedef {import('./types').Channel} Channel
 * @typedef {import('./types').Track} Track
 */

/**
 * @template T
 * @typedef {import('./types').SdkResult<T>} SdkResult
 */

const firebaseHost = 'https://radio4000.firebaseio.com'

// Deterministic namespace for converting Firebase IDs to UUIDs
const R4_NAMESPACE = uuidv5('r4_firebase_random_ids', uuidv5.DNS)

/**
 * Find a Firebase channel by "slug" property
 * @param {string} slug
 * @returns {Promise<SdkResult<FirebaseChannel | null>>}
 */
export async function readChannel(slug) {
	const res = await fetch(`${firebaseHost}/channels.json?orderBy="slug"&equalTo="${slug}"`)
	const json = await res.json()
	if (json.error) return {data: null, error: {message: json.error}}

	const entries = Object.entries(json || {})
	if (!entries.length) return {data: null, error: null}
	const [firebaseId, channelData] = /** @type {[string, Omit<FirebaseChannel, 'id'>]} */ (
		entries[0]
	)

	return {data: {...channelData, id: firebaseId}, error: null}
}

/**
 * Read all Firebase channels (useful for migration)
 * @param {{limit?: number}} [options]
 * @returns {Promise<SdkResult<FirebaseChannel[]>>}
 */
export async function readChannels({limit} = {}) {
	const res = await fetch(`${firebaseHost}/channels.json`)
	const json = await res.json()
	if (json?.error) return {data: null, error: {message: json.error}}

	/** @type {FirebaseChannel[]} */
	const channels = Object.entries(json || {})
		.map(([id, channel]) => ({
			.../** @type {Omit<FirebaseChannel, 'id'>} */ (channel),
			id
		}))
		.sort((a, b) => (a.created || 0) - (b.created || 0))

	return {data: limit ? channels.slice(0, limit) : channels, error: null}
}

/**
 * Find Firebase tracks by either firebase channel ID or slug
 * @param {{channelId?: string, slug?: string}} params
 * @returns {Promise<SdkResult<FirebaseTrack[]>>}
 */
export async function readTracks({channelId, slug}) {
	// If slug provided, fetch channel first to get Firebase ID
	if (slug && !channelId) {
		const {data: channel, error} = await readChannel(slug)
		if (error) return {data: null, error}
		if (!channel) return {data: [], error: null}
		channelId = channel.id
	}

	if (!channelId)
		return {
			data: null,
			error: {message: 'Either slug or channelId is required'}
		}

	const url = `${firebaseHost}/tracks.json?orderBy="channel"&startAt="${channelId}"&endAt="${channelId}"`
	const res = await fetch(url)
	const json = await res.json()
	if (json?.error) return {data: null, error: {message: json.error}}

	/** @type {FirebaseTrack[]} */
	const tracks = Object.entries(json || {})
		.map(([id, track]) => ({
			.../** @type {Omit<FirebaseTrack, 'id'>} */ (track),
			id
		}))
		.sort((a, b) => (a.created || 0) - (b.created || 0))

	return {data: tracks, error: null}
}

/**
 * Parse a Firebase v1 channel into v2 schema
 * @param {FirebaseChannel} firebaseChannel
 * @returns {Channel}
 */
export function parseChannel(firebaseChannel) {
	const updatedAt = new Date(firebaseChannel.updated || firebaseChannel.created).toISOString()

	/** @type {Channel} */
	const channel = {
		coordinates: null,
		id: uuidv5(firebaseChannel.id, R4_NAMESPACE),
		favorites: null,
		firebase_id: firebaseChannel.id,
		followers: null,
		fts: null,
		slug: firebaseChannel.slug,
		name: firebaseChannel.title || '',
		description: firebaseChannel.body || '',
		url: firebaseChannel.link || '',
		image: firebaseChannel.image || '',
		latitude: firebaseChannel.coordinatesLatitude ?? null,
		longitude: firebaseChannel.coordinatesLongitude ?? null,
		track_count: null,
		source: 'v1',
		created_at: new Date(firebaseChannel.created).toISOString(),
		updated_at: updatedAt,
		latest_track_at: null
	}
	return channel
}

/**
 * Parse a Firebase v1 track into v2 schema with tag/mention extraction
 * @param {FirebaseTrack} firebaseTrack
 * @param {string} channelId - v2 channel UUID
 * @param {string} channelSlug
 * @returns {Track}
 */
export function parseTrack(firebaseTrack, channelId, channelSlug) {
	const {mentions, tags} = extractTokens(firebaseTrack.body || '')

	/** @type {Track} */
	const track = {
		created_at: new Date(firebaseTrack.created).toISOString(),
		description: firebaseTrack.body || '',
		discogs_url: firebaseTrack.discogsUrl || '',
		duration: null,
		fts: null,
		id: uuidv5(firebaseTrack.id, R4_NAMESPACE),
		channel_id: channelId,
		firebase_id: firebaseTrack.id,
		slug: channelSlug,
		url: firebaseTrack.url,
		title: firebaseTrack.title,
		tags: tags.length > 0 ? tags : null,
		mentions: mentions.length > 0 ? mentions : null,
		playback_error: null,
		source: 'v1',
		updated_at: new Date(firebaseTrack.created).toISOString()
	}
	return track
}
