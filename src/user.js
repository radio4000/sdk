import {supabase} from './supabase-client.js'

/**
 * Gets the currently signed in user
 * @returns {Promise<{ data?: object, error?: object }>}
 */
export async function getUser() {
	const {data: {user}, error} = await supabase.auth.getUser()
	return {data: user, error}
}

/**
 * Will delete the currently authenticated user's "auth user" and any "user channels".
 * The function is defined in https://github.com/internet4000/radio4000-supabase/blob/main/04-radio4000.sql
 */
export const deleteUser = async () => {
	return supabase.rpc('delete_user')
}
