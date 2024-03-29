import {supabase} from './main.js'

// Three wrappers around the auth methods from Supabase.

/**
 * @param {{email: string, password: string}} param0
 */
export const signUp = async ({email, password}) => {
	return supabase.auth.signUp({email, password})
}

export const signIn = async ({email, password}) => {
	return supabase.auth.signInWithPassword({email, password})
}

export const signOut = async () => {
	return supabase.auth.signOut()
}
