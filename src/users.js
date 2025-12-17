import {supabase} from './create-sdk.js'

/**
 * @typedef {import('@supabase/supabase-js').User} User
 * @typedef {import('./types').SdkResult<User | null>} UserResult
 */

/**
 * Fetches the currently signed in user
 * @returns {Promise<UserResult>}
 */
export async function readUser() {
	const {
		data: {user},
		error
	} = await supabase.auth.getUser()

	if (error) return {data: null, error: {message: error.message, code: error.code}}
	return {data: user, error: null}
}

/**
 * Deletes the currently authenticated user and their channels.
 * @returns {Promise<import('./types').SdkResult<null>>}
 */
export const deleteUser = async () => {
	const {error} = await supabase.rpc('delete_user')
	if (error) return {data: null, error: {message: error.message, code: error.code}}
	return {data: null, error: null}
}
