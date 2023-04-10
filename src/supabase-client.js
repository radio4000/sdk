// import {createClient as createSupabase} from '@supabase/supabase-js'
// const supabaseClient = createSupabase('https://myjhnqgfwqtcicnvcwcj.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MTQxNTQ3MiwiZXhwIjoxOTU2OTkxNDcyfQ.gySR3Lv-m_CIj2Eyx6kfyOdwwMXEOFOgeHSjADqcM4Y')

function createClient() {
  let setClient

	const client = new Promise((resolve) => {
 		setClient = resolve
	})

	return [client, setClient]
}

const [client, setClient] = createClient()

export {client, setClient}


// const supabase = createClient(supabaseUrl, supabaseKey, {
// 	auth: {
// 		// Only attempt local storage in a browser.
// 		persistSession: isBrowser,
// 	},
// })

// export default supabase
// export {supabase}

