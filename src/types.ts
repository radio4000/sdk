import type {Database, Tables} from './database.types'

// Export the Database type for use when creating Supabase clients
export type {Database}

// ---------------------------------------------------------------------------
// Read types - what SDK methods return (from database views)
// ---------------------------------------------------------------------------

/** Channel with computed fields: track_count, latest_track_at */
export type Channel = Tables<'channels_with_tracks'>

/** Track with its channel slug included */
export type ChannelTrack = Tables<'channel_tracks'>

// Base table types (raw table shape without computed fields)
export type ChannelRow = Tables<'channels'>
export type TrackRow = Tables<'tracks'>

// ---------------------------------------------------------------------------
// Write types - parameters for create/update operations
// ---------------------------------------------------------------------------

export interface CreateChannelParams {
	/** Optional client-side UUID. If omitted, Postgres generates one. */
	id?: string
	name: string
	slug: string
	/** Owner user ID. If omitted, uses current session user. */
	userId?: string
	description?: string
	url?: string
	latitude?: number
	longitude?: number
}

export interface UpdateChannelParams {
	name?: string
	slug?: string
	description?: string
	url?: string
	/** Cloudinary image URL. Set to null to remove. */
	image?: string | null
	latitude?: number
	longitude?: number
}

export interface CreateTrackParams {
	/** Optional client-side UUID. If omitted, Postgres generates one. */
	id?: string
	title: string
	url: string
	description?: string
	discogs_url?: string
}

export interface UpdateTrackParams {
	title?: string
	url?: string
	description?: string
	discogs_url?: string
	/** Error message if playback failed */
	playback_error?: string
	/** Duration in seconds */
	duration?: number
}

// ---------------------------------------------------------------------------
// Legacy Firebase v1 types
// ---------------------------------------------------------------------------

/** Channel schema from the legacy Firebase v1 database */
export interface FirebaseChannel {
	id: string
	body?: string
	channelPublic?: string
	coordinatesLatitude?: number
	coordinatesLongitude?: number
	created: number
	favoriteChannels?: Record<string, boolean>
	image?: string
	isFeatured?: boolean
	isPremium?: boolean
	slug: string
	title: string
	tracks?: Record<string, boolean>
	updated: number
}

/** Internal result type for Firebase operations */
export type FirebaseChannelResult =
	| {data: FirebaseChannel | null; error?: never}
	| {data?: never; error: {message: string}}
