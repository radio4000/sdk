import sdk, {SUPABASE_KEY, SUPABASE_URL} from './sdk-default.js'

export {createSdk, supabase} from './create-sdk.js'
export {sdk, SUPABASE_KEY, SUPABASE_URL}

// Pure helpers, usable without a client
export {extractTokens, findTokens} from './utils.js'
export type {Token} from './utils.js'
export {parseQuery} from './search.js'
export type {TrackQuery} from './search.js'

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
