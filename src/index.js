export {supabase} from './supabase-client.js'

import * as auth from './auth.js'
import * as user from './user.js'
import * as channel from './channel.js'
import * as track from './track.js'
import * as providers from './providers/index.js'

export default {
	...auth,
	...user,
	...channel,
	...track,
	...providers
}

export * from './auth.js'
export * from './user.js'
export * from './channel.js'
export * from './track.js'
export * from './providers/index.js'
