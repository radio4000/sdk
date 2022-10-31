import * as auth from './auth.js'
import * as users from './users.js'
import * as channels from './channels.js'
import * as tracks from './tracks.js'

export {mediaUrlParser} from 'media-url-parser'
import supabase from './supabase-client.js'

// `import sdk`
export default {
	supabase,
	auth,
	users,
	channels,
	tracks,
	// `import {createTrack, createChannel...}` e.g. everything squashed together
}

// `import {auth, track} from ...`
export {
	supabase,
	auth,
	users,
	channels,
	tracks,
}

export * from './auth.js'
export * from './users.js'
export * from './channels.js'
export * from './tracks.js'
