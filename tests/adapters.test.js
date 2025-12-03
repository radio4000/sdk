import {describe, it, expect, beforeEach} from 'vitest'
import {BrowserStorageAdapter} from '../src/adapters/browser.js'

// Mock localStorage for Node.js environment
class MockStorage {
	constructor() {
		this.store = {}
	}

	getItem(key) {
		return this.store[key] || null
	}

	setItem(key, value) {
		this.store[key] = value
	}

	removeItem(key) {
		delete this.store[key]
	}

	clear() {
		this.store = {}
	}

	get length() {
		return Object.keys(this.store).length
	}

	key(index) {
		return Object.keys(this.store)[index] || null
	}
}

describe('BrowserStorageAdapter', () => {
	let adapter
	let storage

	beforeEach(() => {
		storage = new MockStorage()
		adapter = new BrowserStorageAdapter({
			prefix: 'test',
			storage
		})
	})

	describe('Basic CRUD', () => {
		it('should insert a record', async () => {
			const {data, error} = await adapter
				.from('channels')
				.insert({name: 'Test Channel', slug: 'test'})
				.select()
				.single()

			expect(error).toBeNull()
			expect(data).toBeDefined()
			expect(data.name).toBe('Test Channel')
			expect(data.slug).toBe('test')
			expect(data.id).toBeDefined()
			expect(data.created_at).toBeDefined()
		})

		it('should select all records', async () => {
			// Insert some records
			await adapter.from('channels').insert({name: 'Channel 1', slug: 'ch1'})
			await adapter.from('channels').insert({name: 'Channel 2', slug: 'ch2'})

			const {data, error} = await adapter.from('channels').select('*')

			expect(error).toBeNull()
			expect(data).toHaveLength(2)
			expect(data[0].name).toBe('Channel 1')
			expect(data[1].name).toBe('Channel 2')
		})

		it('should filter with eq', async () => {
			await adapter.from('channels').insert({name: 'Channel 1', slug: 'ch1'})
			await adapter.from('channels').insert({name: 'Channel 2', slug: 'ch2'})

			const {data, error} = await adapter.from('channels').select('*').eq('slug', 'ch1')

			expect(error).toBeNull()
			expect(data).toHaveLength(1)
			expect(data[0].slug).toBe('ch1')
		})

		it('should update records', async () => {
			const {data: channel} = await adapter
				.from('channels')
				.insert({name: 'Old Name', slug: 'test'})
				.select()
				.single()

			// Small delay to ensure updated_at timestamp differs
			await new Promise(resolve => setTimeout(resolve, 10))

			const {data, error} = await adapter
				.from('channels')
				.update({name: 'New Name'})
				.eq('id', channel.id)
				.select()

			expect(error).toBeNull()
			expect(data[0].name).toBe('New Name')
			expect(data[0].slug).toBe('test')
			expect(data[0].updated_at).not.toBe(channel.updated_at)
		})

		it('should delete records', async () => {
			const {data: channel} = await adapter
				.from('channels')
				.insert({name: 'To Delete', slug: 'delete-me'})
				.select()
				.single()

			await adapter.from('channels').delete().eq('id', channel.id)

			const {data} = await adapter.from('channels').select('*')
			expect(data).toHaveLength(0)
		})
	})

	describe('Query builder', () => {
		beforeEach(async () => {
			// Insert test data
			await adapter.from('channels').insert({name: 'Alpha', slug: 'alpha', created_at: '2024-01-01'})
			await adapter.from('channels').insert({name: 'Beta', slug: 'beta', created_at: '2024-01-02'})
			await adapter.from('channels').insert({name: 'Gamma', slug: 'gamma', created_at: '2024-01-03'})
		})

		it('should order results', async () => {
			const {data} = await adapter
				.from('channels')
				.select('*')
				.order('name', {ascending: true})

			expect(data[0].name).toBe('Alpha')
			expect(data[1].name).toBe('Beta')
			expect(data[2].name).toBe('Gamma')
		})

		it('should limit results', async () => {
			const {data} = await adapter.from('channels').select('*').limit(2)

			expect(data).toHaveLength(2)
		})

		it('should return single result', async () => {
			const {data, error} = await adapter.from('channels').select('*').eq('slug', 'beta').single()

			expect(error).toBeNull()
			expect(data.name).toBe('Beta')
		})

		it('should chain multiple operations', async () => {
			const {data} = await adapter
				.from('channels')
				.select('*')
				.eq('slug', 'beta')
				.order('created_at', {ascending: false})
				.limit(1)

			expect(data).toHaveLength(1)
			expect(data[0].name).toBe('Beta')
		})
	})

	describe('Auth', () => {
		it('should sign in', async () => {
			const {data, error} = await adapter.auth.signInWithPassword({
				email: 'test@example.com',
				password: 'password'
			})

			expect(error).toBeNull()
			expect(data.user).toBeDefined()
			expect(data.user.email).toBe('test@example.com')
			expect(data.session).toBeDefined()
		})

		it('should get session', async () => {
			await adapter.auth.signInWithPassword({
				email: 'test@example.com',
				password: 'password'
			})

			const {data} = await adapter.auth.getSession()

			expect(data.session).toBeDefined()
			expect(data.session.user.email).toBe('test@example.com')
		})

		it('should sign out', async () => {
			await adapter.auth.signInWithPassword({
				email: 'test@example.com',
				password: 'password'
			})

			await adapter.auth.signOut()

			const {data} = await adapter.auth.getSession()
			expect(data.session).toBeNull()
		})

		it('should notify auth state change listeners', async () => {
			let callbackCalled = false
			let lastEvent = null

			adapter.auth.onAuthStateChange((event, session) => {
				callbackCalled = true
				lastEvent = event
			})

			await adapter.auth.signInWithPassword({
				email: 'test@example.com',
				password: 'password'
			})

			expect(callbackCalled).toBe(true)
			expect(lastEvent).toBe('SIGNED_IN')
		})
	})

	describe('Persistence', () => {
		it('should persist data in storage', async () => {
			await adapter.from('channels').insert({name: 'Persisted', slug: 'persisted'})

			// Check localStorage directly
			const stored = JSON.parse(storage.getItem('test:channels'))
			expect(stored).toHaveLength(1)
			expect(stored[0].name).toBe('Persisted')
		})

		it('should load persisted data', async () => {
			// Manually set data in storage
			storage.setItem(
				'test:channels',
				JSON.stringify([{id: '123', name: 'From Storage', slug: 'from-storage'}])
			)

			const {data} = await adapter.from('channels').select('*')

			expect(data).toHaveLength(1)
			expect(data[0].name).toBe('From Storage')
		})
	})

	describe('Edge cases', () => {
		it('should handle empty table', async () => {
			const {data} = await adapter.from('empty_table').select('*')

			expect(data).toHaveLength(0)
		})

		it('should handle single() with no results', async () => {
			const {data, error} = await adapter.from('channels').select('*').eq('slug', 'nonexistent').single()

			expect(data).toBeNull()
			expect(error).toBeDefined()
			expect(error.message).toContain('No rows found')
		})

		it('should generate unique IDs', async () => {
			const {data: ch1} = await adapter.from('channels').insert({name: 'Ch1'}).select().single()
			const {data: ch2} = await adapter.from('channels').insert({name: 'Ch2'}).select().single()

			expect(ch1.id).not.toBe(ch2.id)
		})

		it('should use provided ID', async () => {
			const customId = 'my-custom-id'
			const {data} = await adapter.from('channels').insert({id: customId, name: 'Custom'}).select().single()

			expect(data.id).toBe(customId)
		})
	})
})
