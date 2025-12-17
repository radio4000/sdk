import type {Database, Tables} from './database.types'

// Export the Database type for use when creating Supabase clients
export type {Database}

// ---------------------------------------------------------------------------
// Read types - what SDK methods return (from database views)
// ---------------------------------------------------------------------------

/** Channel with computed fields: track_count, latest_track_at */
export type Channel = Tables<'channels_with_tracks'> & {
	source?: 'v1' | 'v2'
}

/** Track from the channel_tracks view (includes channel slug) */
export type Track = Tables<'channel_tracks'> & {
	firebase_id?: string
	channel_id?: string
	source?: 'v1' | 'v2'
}

// Base table types (raw table shape without computed fields)
export type ChannelRow = Tables<'channels'>
export type TrackRow = Tables<'tracks'>

export type SdkError = {message: string; code?: string}

export type SdkResult<T> = {data: T; error: null} | {data: null; error: SdkError}

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
	// Note: tags and mentions are computed by PostgreSQL from the description field
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
	// Note: tags and mentions are computed by PostgreSQL from the description field
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

/** Track schema from the legacy Firebase v1 database */
export interface FirebaseTrack {
	id: string
	channel: string
	url: string
	title: string
	body?: string
	discogsUrl?: string
	created: number
	updated?: number
}
