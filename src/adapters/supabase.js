import {BaseAdapter} from './interface.js'

/**
 * Supabase adapter - wraps a Supabase client to match our interface
 * This is mostly a pass-through since Supabase already matches our needs
 */
export class SupabaseAdapter extends BaseAdapter {
	/**
	 * @param {import('@supabase/supabase-js').SupabaseClient} client
	 */
	constructor(client) {
		super()
		if (!client) throw new Error('Supabase client is required')
		this.client = client
		this.type = 'supabase'
	}

	/**
	 * Access the underlying Supabase client directly
	 * Useful for advanced Supabase-specific features
	 */
	get raw() {
		return this.client
	}

	/**
	 * Create a query builder for a table
	 * @param {string} table
	 */
	from(table) {
		return this.client.from(table)
	}

	/**
	 * Auth methods
	 */
	get auth() {
		return this.client.auth
	}
}
