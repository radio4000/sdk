import sdk, {SUPABASE_KEY, SUPABASE_URL} from './sdk-default.js'

export {createSdk, supabase} from './create-sdk.js'
export {sdk, SUPABASE_KEY, SUPABASE_URL}

// Types
export type {
	Channel,
	Track,
	ChannelRow,
	TrackRow,
	ChannelBackup,
	Database,
	Broadcast,
	BroadcastRow,
	BroadcastDeckState,
	UpdateBroadcastParams,
	CreateChannelParams,
	UpdateChannelParams,
	CreateTrackParams,
	UpdateTrackParams
} from './types'
