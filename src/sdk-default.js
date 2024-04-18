// const {createClient} = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
import {createClient} from '@supabase/supabase-js'
import {createSdk} from './create-sdk.js'

const {VITE_SUPABASE_URL, VITE_SUPABASE_KEY} = import.meta.env

const supabase = createClient(VITE_SUPABASE_URL, VITE_SUPABASE_KEY)

/**
 * The default Radio4000 SDK connects to the main Supabase project.
 */
const sdk = createSdk(supabase)

export default sdk
