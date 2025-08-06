import {createClient} from '@supabase/supabase-js'
import {createSdk} from '../src/main.js'

// Create a Supabase client connected to the "R4" test database.
const url = 'https://dwjepbmqjtijxhrassfo.supabase.co'
const key =
	'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR3amVwYm1xanRpanhocmFzc2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NzkxMzU5MzksImV4cCI6MTk5NDcxMTkzOX0.NOLqBQN_E09UOwJeeiW-0ZDu2LL_9eqlqXNJlbhxa74'
const supabase = createClient(url, key, {
	auth: {
		persistSession: false
	}
})

// Create and export the SDK.
export const sdk = createSdk(supabase)
