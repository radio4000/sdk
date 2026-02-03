import type {Database, Tables} from './database.types'
import type {PostgrestError} from '@supabase/postgrest-js'

export type SdkError = {message: string; code?: string} | PostgrestError
export type SdkResult<T> = {data: T; error: null} | {data: null; error: SdkError}

// Export the Database type for use when creating Supabase clients
export type {Database}

/**
 * We have types generated from our database schema (npm run pull-db-types),
 * however they are not always accurate, so we overwrite them as needed here.
 */

/**
 * Base/row types without joins or computed fields
 */

// Omit coordinates to discourage usage in SDK clients
export type ChannelRow = Omit<Tables<'channels'>, 'coordinates'>
export type TrackRow = Tables<'tracks'>

/**
 * Channel with computed fields
 */
export type Channel = Omit<
	Tables<'channels_with_tracks'>,
	| 'id'
	| 'name'
	| 'slug'
	| 'created_at'
	| 'updated_at'
	| 'coordinates'
	| 'fts'
	| 'track_count'
	| 'latest_track_at'
> & {
	// supabase thinks these are optional, they are not
	id: string
	name: string
	slug: string
	created_at: string
	updated_at: string
	// supabase thinks these are required, they are not.
	fts?: string | null
	track_count?: number | null
	latest_track_at?: string | null
	// new, computed fields
	source?: 'v1' | 'v2'
}

/**
 * Track from the channel_tracks view (includes channel slug)
 * Note: id/title/url/created_at are overridden as non-null because the tracks
 * table has NOT NULL constraints, but Postgres views lose that type information.
 */
export type Track = Omit<
	Tables<'channel_tracks'>,
	'id' | 'title' | 'url' | 'created_at' | 'updated_at' | 'media_id' | 'provider'
> & {
	// supabase thinks these are optional, they are not.
	id: string
	title: string
	url: string
	created_at: string
	updated_at: string
	// supabase thinks these are required, they are not.
	media_id?: string | null
	provider?: string | null
	// new, computed fields
	firebase_id?: string
	channel_id?: string
	source?: 'v1' | 'v2'
}

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
	link?: string
	slug: string
	title: string
	tracks?: Record<string, boolean>
	updated?: number
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
}
