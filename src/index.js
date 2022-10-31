import * as auth from './auth.js'
import * as user from './user.js'
import * as channel from './channel.js'
import * as track from './track.js'

export {mediaUrlParser} from 'media-url-parser'
export {supabase} from './supabase-client.js'

// `import sdk`
export default {
	auth,
	user,
	channel,
	track,
	// `import {createTrack, createChannel...}` e.g. everything squashed together
	// ...user,
	// ...channel,
	// ...track,

}

// `import {auth, track} from ...`
export {
	auth,
	user,
	channel,
	track,
}

export * from './auth.js'
export * from './user.js'
export * from './channel.js'
export * from './track.js'
