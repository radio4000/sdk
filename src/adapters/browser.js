import {BaseAdapter} from './interface.js'

/**
 * Browser storage adapter using localStorage
 * This is a proof-of-concept for local-first/offline-first usage
 *
 * Data structure in localStorage:
 * - radio4000:table_name = JSON array of records
 * - radio4000:session = current session object
 */
export class BrowserStorageAdapter extends BaseAdapter {
	constructor(config = {}) {
		super(config)
		this.type = 'browser'
		this.prefix = config.prefix || 'radio4000'
		this.storage = config.storage || (typeof localStorage !== 'undefined' ? localStorage : null)

		if (!this.storage) {
			throw new Error('localStorage is not available in this environment')
		}

		// Initialize auth state
		this._session = this._getItem('session') || null
		this._authCallbacks = []
	}

	/**
	 * Get storage key for a table
	 * @private
	 */
	_getKey(table) {
		return `${this.prefix}:${table}`
	}

	/**
	 * Get item from storage
	 * @private
	 */
	_getItem(key) {
		try {
			const item = this.storage.getItem(this._getKey(key))
			return item ? JSON.parse(item) : null
		} catch (e) {
			console.error('Error parsing storage item:', e)
			return null
		}
	}

	/**
	 * Set item in storage
	 * @private
	 */
	_setItem(key, value) {
		this.storage.setItem(this._getKey(key), JSON.stringify(value))
	}

	/**
	 * Get all records from a table
	 * @private
	 */
	_getTable(table) {
		return this._getItem(table) || []
	}

	/**
	 * Save all records to a table
	 * @private
	 */
	_setTable(table, records) {
		this._setItem(table, records)
	}

	/**
	 * Generate a simple UUID
	 * @private
	 */
	_generateId() {
		return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
	}

	/**
	 * Create a query builder for a table
	 * @param {string} table
	 */
	from(table) {
		return new BrowserQueryBuilder(this, table)
	}

	/**
	 * Auth methods for browser storage
	 */
	get auth() {
		return {
			getSession: async () => {
				return {
					data: {
						session: this._session
					}
				}
			},

			signInWithPassword: async ({email, password}) => {
				// Simple mock auth - in real implementation you'd validate
				const user = {
					id: this._generateId(),
					email,
					created_at: new Date().toISOString()
				}

				this._session = {
					user,
					access_token: `mock_token_${this._generateId()}`
				}

				this._setItem('session', this._session)

				// Notify listeners
				this._authCallbacks.forEach(cb =>
					cb('SIGNED_IN', this._session)
				)

				return {
					data: {
						user,
						session: this._session
					},
					error: null
				}
			},

			signUp: async ({email, password}) => {
				// Same as sign in for this mock
				return this.auth.signInWithPassword({email, password})
			},

			signOut: async () => {
				this._session = null
				this._setItem('session', null)

				// Notify listeners
				this._authCallbacks.forEach(cb =>
					cb('SIGNED_OUT', null)
				)

				return {error: null}
			},

			onAuthStateChange: (callback) => {
				this._authCallbacks.push(callback)

				return {
					data: {
						subscription: {
							unsubscribe: () => {
								const index = this._authCallbacks.indexOf(callback)
								if (index > -1) {
									this._authCallbacks.splice(index, 1)
								}
							}
						}
					}
				}
			}
		}
	}
}

/**
 * Query builder for browser storage
 * Implements a subset of Supabase query builder API
 */
class BrowserQueryBuilder {
	constructor(adapter, table) {
		this.adapter = adapter
		this.table = table
		this.query = {
			operation: null, // 'select', 'insert', 'update', 'delete'
			columns: '*',
			filters: [],
			orderBy: null,
			limitCount: null,
			single: false,
			data: null,
			needsSelect: false // Track if we need to return data after insert/update
		}
	}

	/**
	 * Select columns
	 */
	select(columns = '*') {
		// If we already have an operation (insert/update), mark that we need to select after
		if (this.query.operation === 'insert' || this.query.operation === 'update') {
			this.query.needsSelect = true
		} else {
			this.query.operation = 'select'
		}
		this.query.columns = columns
		return this
	}

	/**
	 * Insert data
	 */
	insert(data) {
		this.query.operation = 'insert'
		this.query.data = data
		return this
	}

	/**
	 * Update data
	 */
	update(data) {
		this.query.operation = 'update'
		this.query.data = data
		return this
	}

	/**
	 * Delete records
	 */
	delete() {
		this.query.operation = 'delete'
		return this
	}

	/**
	 * Filter by equality
	 */
	eq(column, value) {
		this.query.filters.push({column, operator: 'eq', value})
		return this
	}

	/**
	 * Order results
	 */
	order(column, options = {}) {
		this.query.orderBy = {
			column,
			ascending: options.ascending !== false
		}
		return this
	}

	/**
	 * Limit results
	 */
	limit(count) {
		this.query.limitCount = count
		return this
	}

	/**
	 * Return single result
	 */
	single() {
		this.query.single = true
		return this
	}

	/**
	 * Execute the query
	 * Returns a promise to match Supabase API
	 */
	async then(resolve, reject) {
		try {
			const result = await this._execute()
			resolve(result)
		} catch (error) {
			const result = {data: null, error}
			if (reject) {
				reject(result)
			} else {
				resolve(result)
			}
		}
	}

	/**
	 * Execute the query
	 * @private
	 */
	async _execute() {
		let records = this.adapter._getTable(this.table)

		switch (this.query.operation) {
			case 'select':
				return this._executeSelect(records)

			case 'insert':
				return this._executeInsert(records)

			case 'update':
				return this._executeUpdate(records)

			case 'delete':
				return this._executeDelete(records)

			default:
				return {
					data: null,
					error: new Error('No operation specified')
				}
		}
	}

	/**
	 * Execute SELECT
	 * @private
	 */
	_executeSelect(records) {
		let results = [...records]

		// Apply filters
		for (const filter of this.query.filters) {
			results = results.filter(record => {
				if (filter.operator === 'eq') {
					return record[filter.column] === filter.value
				}
				return true
			})
		}

		// Apply ordering
		if (this.query.orderBy) {
			const {column, ascending} = this.query.orderBy
			results.sort((a, b) => {
				const aVal = a[column]
				const bVal = b[column]
				const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
				return ascending ? comparison : -comparison
			})
		}

		// Apply limit
		if (this.query.limitCount) {
			results = results.slice(0, this.query.limitCount)
		}

		// Return single or array
		if (this.query.single) {
			return {
				data: results[0] || null,
				error: results.length === 0 ? new Error('No rows found') : null
			}
		}

		return {data: results, error: null}
	}

	/**
	 * Execute INSERT
	 * @private
	 */
	_executeInsert(records) {
		const dataArray = Array.isArray(this.query.data)
			? this.query.data
			: [this.query.data]

		const newRecords = dataArray.map(item => ({
			id: item.id || this.adapter._generateId(),
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			...item
		}))

		const updatedRecords = [...records, ...newRecords]
		this.adapter._setTable(this.table, updatedRecords)

		// If .select() was not called, return null data (like Supabase)
		if (!this.query.needsSelect) {
			return {data: null, error: null}
		}

		// Return the inserted records
		if (this.query.single) {
			return {data: newRecords[0] || null, error: null}
		}

		return {data: newRecords, error: null}
	}

	/**
	 * Execute UPDATE
	 * @private
	 */
	_executeUpdate(records) {
		const updatedRecords = records.map(record => {
			// Check if this record matches filters
			const matches = this.query.filters.every(filter => {
				if (filter.operator === 'eq') {
					return record[filter.column] === filter.value
				}
				return true
			})

			if (matches) {
				return {
					...record,
					...this.query.data,
					updated_at: new Date().toISOString()
				}
			}

			return record
		})

		this.adapter._setTable(this.table, updatedRecords)

		// If .select() was not called, return null data (like Supabase)
		if (!this.query.needsSelect) {
			return {data: null, error: null}
		}

		// Return updated records
		const changed = updatedRecords.filter((record, index) =>
			this.query.filters.every(filter =>
				record[filter.column] === filter.value
			)
		)

		if (this.query.single) {
			return {data: changed[0] || null, error: null}
		}

		return {data: changed, error: null}
	}

	/**
	 * Execute DELETE
	 * @private
	 */
	_executeDelete(records) {
		const remainingRecords = records.filter(record => {
			// Keep record if it doesn't match all filters
			return !this.query.filters.every(filter => {
				if (filter.operator === 'eq') {
					return record[filter.column] === filter.value
				}
				return true
			})
		})

		this.adapter._setTable(this.table, remainingRecords)

		return {data: null, error: null}
	}
}
