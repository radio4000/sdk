import type {Database} from './database.types'

// Export the Database type for use when creating Supabase clients
export type {Database}

// Function parameter types that are more user-friendly
export interface CreateChannelParams {
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
	title: string
	url: string
	description?: string
	discogs_url?: string
	tags?: string[]
	mentions?: string[]
}

export interface UpdateTrackParams {
	title?: string
	url?: string
	description?: string
	discogs_url?: string
	tags?: string[]
	mentions?: string[]
}

// Firebase legacy channel type (different from Database Channel)
export interface FirebaseChannel {
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
	browse: typeof import('./browse.js')
	supabase: import('@supabase/supabase-js').SupabaseClient<Database>
}
