import { supabase } from './supabase-client.js'
import { signUp, signIn, signOut } from './auth.js'
import { getUser, deleteUser } from './user.js'
import { createChannel, updateChannel, deleteChannel, findChannels, findChannelBySlug, findFirebaseChannelBySlug, findUserChannels, findChannelTracks } from './channel.js'
import { createTrack, updateTrack, deleteTrack, findTrack } from './track.js'
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
	findUserChannels,
	findFirebaseChannelBySlug,
	findChannelBySlug,
	findChannelTracks,

	/* tracks */
	createTrack,
	updateTrack,
	deleteTrack,
	findTrack,

	/* media providers */
	providers,
}

export default sdk
