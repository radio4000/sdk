import {supabase} from './supabase-client.js'

export async function getUser() {
	const {data, error} = await supabase.auth.getUser()
	if (error) return {error}
	return data.user
}

// Will delete the currently authenticated user's "auth user" and any "user channels".
// The function is defined in https://github.com/internet4000/radio4000-supabase/blob/main/04-radio4000.sql
export const deleteUser = async () => {
	return supabase.rpc('delete_user')
}
