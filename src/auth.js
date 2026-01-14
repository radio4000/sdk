import {supabase} from './create-sdk.js'

/**
 * @typedef {import('@supabase/supabase-js').SignUpWithPasswordCredentials} SignUpWithPasswordCredentials
 * @typedef {import('@supabase/supabase-js').SignInWithPasswordCredentials} SignInWithPasswordCredentials
 */

/**
 * @param {SignUpWithPasswordCredentials} params
 */
export const signUp = async (params) => {
	return supabase.auth.signUp(params)
}

/**
 * @param {SignInWithPasswordCredentials} params
 */
export const signIn = async (params) => {
	return supabase.auth.signInWithPassword(params)
}

export const signOut = async () => {
	return supabase.auth.signOut()
}
