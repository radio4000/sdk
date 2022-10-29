import mediaUrlParser from 'media-url-parser'

import * as auth from './auth.js'
import * as user from './user.js'
import * as channel from './channel.js'
import * as track from './track.js'

export {supabase} from './supabase-client.js'

// allows `import {auth, createTrack, createChannel...}`
// export default {
// 	auth,
// 	...user,
// 	...channel,
// 	...track,
// }

// allows `import sdk from ...`
export default {
	auth,
	user,
	channel,
	track,
	mediaUrlParser
}

// allows `import {auth, track} from ...`
export {
	auth,
	user,
	channel,
	track,
	mediaUrlParser
}

// export * from './auth.js'
// export * from './user.js'
// export * from './channel.js'
// export * from './track.js'
// export * from './providers/index.js'
