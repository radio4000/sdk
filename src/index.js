import { supabase } from './supabase-client.js'
import { signUp, signIn, signOut } from './auth.js'
import { deleteUser } from './user.js'
import { createChannel, updateChannel, deleteChannel } from './channel.js'
import { createTrack, updateTrack, deleteTrack } from './track.js'

export {
	supabase,
	signUp, signIn, signOut,
	deleteUser,
	createChannel, updateChannel, deleteChannel,
	createTrack, updateTrack, deleteTrack
}

