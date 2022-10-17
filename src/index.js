import { supabase } from './supabase-client.js'
import { signUp, signIn, signOut } from './auth.js'
import { deleteUser } from './user.js'
import { createChannel, updateChannel, deleteChannel, findChannels, findChannelBySlug } from './channel.js'
import { createTrack, updateTrack, deleteTrack } from './track.js'

const sdk = {
	supabase,
	signUp, signIn, signOut,
	deleteUser,
	createChannel, updateChannel, deleteChannel, findChannels, findChannelBySlug,
	createTrack, updateTrack, deleteTrack
}

export default sdk
