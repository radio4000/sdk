import type {Database, Tables} from './database.types'

// Export the Database type for use when creating Supabase clients
export type {Database}

// Named type aliases for what the SDK methods return
// These come from database views, not base tables

/** A channel with track_count and latest_track_at from "channels_with_tracks" view */
export type Channel = Tables<'channels_with_tracks'>

/** A track with channel slug from "channel_tracks" view */
export type ChannelTrack = Tables<'channel_tracks'>

// Base table types (for when you need the raw table shape)
export type ChannelRow = Tables<'channels'>
export type TrackRow = Tables<'tracks'>

// Function parameter types that are more user-friendly
export interface CreateChannelParams {
	id?: string
	name: string
	slug: string
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
	latitude?: number
	longitude?: number
}

export interface CreateTrackParams {
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
	playback_error?: string
	duration?: number
}

// A channel as it looks in our v1 Firebase legacy database
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

// Return type for Firebase operations
export type FirebaseChannelResult =
	| {data: FirebaseChannel | null; error?: never}
	| {data?: never; error: {message: string}}

// SDK instance type
export interface SDK {
	auth: typeof import('./auth.js')
	users: typeof import('./users.js')
	channels: typeof import('./channels.js')
	tracks: typeof import('./tracks.js')
	firebase: typeof import('./firebase.js')
	browse: typeof import('./browse.js')
	supabase: import('@supabase/supabase-js').SupabaseClient<Database>
}
