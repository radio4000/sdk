import {supabase} from './supabase-client.js'

// Three wrappers around the auth methods from Supabase.

export const signUp = async ({email, password}) => {
	return supabase.auth.signUp({email, password})
}

export const signIn = async ({email, password}) => {
	return supabase.auth.signInWithPassword({email, password})
}

export const signOut = async () => {
	return supabase.auth.signOut()
}
