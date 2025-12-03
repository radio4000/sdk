/**
 * Common interface for all storage adapters
 * Each adapter must implement these methods to work with the SDK
 */

/**
 * @typedef {Object} QueryBuilder
 * @property {(columns: string) => QueryBuilder} select
 * @property {(column: string, value: any) => QueryBuilder} eq
 * @property {(data: Object) => QueryBuilder} insert
 * @property {(data: Object) => QueryBuilder} update
 * @property {() => QueryBuilder} delete
 * @property {(column: string, options?: {ascending: boolean}) => QueryBuilder} order
 * @property {(count: number) => QueryBuilder} limit
 * @property {() => QueryBuilder} single
 * @property {() => Promise<{data: any, error: any}>} [then] - Makes it thenable
 */

/**
 * @typedef {Object} AuthAdapter
 * @property {() => Promise<{data: {session: any}}>} getSession
 * @property {(email: string, password: string) => Promise<{data: any, error: any}>} signInWithPassword
 * @property {(credentials: Object) => Promise<{data: any, error: any}>} signUp
 * @property {() => Promise<{error: any}>} signOut
 * @property {(callback: Function) => {data: {subscription: any}}} onAuthStateChange
 */

/**
 * @typedef {Object} ClientAdapter
 * @property {(table: string) => QueryBuilder} from
 * @property {AuthAdapter} auth
 * @property {string} type - Adapter type identifier (e.g., 'supabase', 'browser', 'atproto')
 */

/**
 * Base adapter class that can be extended
 */
export class BaseAdapter {
	constructor(config = {}) {
		this.config = config
		this.type = 'base'
	}

	/**
	 * Create a query builder for a table
	 * @param {string} table
	 * @returns {QueryBuilder}
	 */
	from(table) {
		throw new Error('from() must be implemented by adapter')
	}

	/**
	 * Auth methods
	 * @returns {AuthAdapter}
	 */
	get auth() {
		throw new Error('auth must be implemented by adapter')
	}
}
