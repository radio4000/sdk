import { supabase } from './supabase-client.js'
import { signUp, signIn, signOut } from './auth.js'
import { getUser, deleteUser } from './user.js'
import { createChannel, updateChannel, deleteChannel, findChannels, findChannelBySlug, findUserChannels } from './channel.js'
import { createTrack, updateTrack, deleteTrack } from './track.js'
import providers from './providers/index.js'

const sdk = {
	/* supabase itself */
	supabase,

	/* authentication */
	signUp, signIn, signOut,

	/* user */
	getUser, deleteUser,

	/* channels */
	createChannel,
	updateChannel,
	deleteChannel,
	findChannels,
	findChannelBySlug,
	findUserChannels,

	/* tracks */
	createTrack,
	updateTrack,
	deleteTrack,

	/* media providers */
	providers,
}

export default sdk
