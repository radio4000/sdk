import sdk, {SUPABASE_KEY, SUPABASE_URL} from './sdk-default.js'

export {createSdk, supabase} from './create-sdk.js'
export {sdk, SUPABASE_KEY, SUPABASE_URL}

// Types
export type {
	Channel,
	Track,
	ChannelRow,
	TrackRow,
	Database,
	Broadcast,
	BroadcastRow,
	BroadcastDeckState,
	UpdateBroadcastParams,
	CreateChannelParams,
	UpdateChannelParams,
	CreateTrackParams,
	UpdateTrackParams,
	FirebaseChannel,
	FirebaseTrack
} from './types'
