import {SupabaseAdapter} from './supabase.js'
import {BrowserStorageAdapter} from './browser.js'

/**
 * Create an adapter based on type
 * @param {string} type - 'supabase', 'browser', or custom adapter instance
 * @param {any} clientOrConfig - Client or configuration for the adapter
 * @returns {import('./interface.js').ClientAdapter}
 */
export function createAdapter(type, clientOrConfig) {
	// If already an adapter, return as-is
	if (clientOrConfig && typeof clientOrConfig.from === 'function' && clientOrConfig.type) {
		return clientOrConfig
	}

	switch (type) {
		case 'supabase':
			return new SupabaseAdapter(clientOrConfig)

		case 'browser':
			return new BrowserStorageAdapter(clientOrConfig)

		default:
			throw new Error(`Unknown adapter type: ${type}. Use 'supabase', 'browser', or pass a custom adapter.`)
	}
}

export {SupabaseAdapter} from './supabase.js'
export {BrowserStorageAdapter} from './browser.js'
export {BaseAdapter} from './interface.js'
