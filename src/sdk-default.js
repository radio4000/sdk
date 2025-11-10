// const {createClient} = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
import {createClient} from '@supabase/supabase-js'
import {createSdk} from './create-sdk.js'

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY

/** @type {import('@supabase/supabase-js').SupabaseClient<import('./database.types.js').Database>} */
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

/**
 * The default Radio4000 SDK connects to the main Supabase project.
 */
const sdk = createSdk(supabase)

export default sdk
