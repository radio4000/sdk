import sdk, {SUPABASE_KEY, SUPABASE_URL} from './sdk-default.js'

export {createSdk, supabase} from './create-sdk.js'
export {sdk, SUPABASE_KEY, SUPABASE_URL}

// Types
export type {
	Channel,
	ChannelTrack,
	ChannelRow,
	TrackRow,
	Database,
	CreateChannelParams,
	UpdateChannelParams,
	CreateTrackParams,
	UpdateTrackParams,
	FirebaseChannel
} from './types'
