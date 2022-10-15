import {supabase} from './supabase-client.js'

// Will delete the currently authenticated user's "auth user" and any "user channels".
// The function is defined in https://github.com/internet4000/radio4000-supabase/blob/main/04-radio4000.sql
export const deleteUser = async () => {
	return supabase.rpc('delete_user')
}
