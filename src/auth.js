import {supabase} from './create-sdk.js'

/** @param {{email: string, password: string, options?: object}} params */
export const signUp = async ({email, password, options}) => {
	return supabase.auth.signUp({email, password, options})
}

/** @param {{email: string, password: string, options?: object}} params */
export const signIn = async ({email, password, options}) => {
	return supabase.auth.signInWithPassword({email, password, options})
}

export const signOut = async () => {
	return supabase.auth.signOut()
}
