import {supabase} from './main.js'

// Three wrappers around the auth methods from Supabase.

/**
 * @param {{email: string, password: string, options: object}} param0
 */
export const signUp = async ({email, password, options = {}}) => {
	return supabase.auth.signUp({email, password, options})
}

export const signIn = async ({email, password}) => {
	return supabase.auth.signInWithPassword({email, password})
}

export const signOut = async () => {
	return supabase.auth.signOut()
}
