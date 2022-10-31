import * as auth from './auth.js'
import * as user from './users.js'
import * as channel from './channels.js'
import * as track from './tracks.js'

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
export * from './users.js'
export * from './channels.js'
export * from './tracks.js'
