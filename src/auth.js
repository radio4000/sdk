import {supabase} from './supabase-client.js'

// Three wrappers around the auth methods from Supabase.

export const signUp = async ({email, password}) => {
	console.log('sign up', email, password)
	return supabase.auth.signUp({email, password})
}

export const signIn = async ({email, password}) => {
	console.log('signin', email, password)
	return supabase.auth.signInWithPassword({email, password})
}

export const signOut = async () => {
	console.log('signout')
	return supabase.auth.signOut()
}
