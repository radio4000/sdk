import {describe, expect, test} from 'vitest'
import '../src/main.js' // Initialize supabase client
import {query, supabaseOperators} from '../src/browse.js'

describe('browse.query', () => {
	test('fetches channels with basic query', async () => {
		const {data, error} = await query({
			table: 'channels',
			select: '*',
			limit: 5,
			page: 1,
			orderBy: 'created_at'
		})

		expect(error).toBeNull()
		expect(data).toBeDefined()
		expect(Array.isArray(data)).toBe(true)
		expect(data.length).toBeLessThanOrEqual(5)
	})

	test('fetches tracks with basic query', async () => {
		const {data, error} = await query({
			table: 'tracks',
			select: '*',
			limit: 10,
			page: 1,
			orderBy: 'created_at'
		})

		expect(error).toBeNull()
		expect(data).toBeDefined()
		expect(Array.isArray(data)).toBe(true)
	})

	test('supports pagination', async () => {
		const page1 = await query({
			table: 'channels',
			select: 'id, slug',
			limit: 3,
			page: 1,
			orderBy: 'created_at'
		})
		const page2 = await query({
			table: 'channels',
			select: 'id, slug',
			limit: 3,
			page: 2,
			orderBy: 'created_at'
		})

		expect(page1.error).toBeNull()
		expect(page2.error).toBeNull()
		expect(page1.data).toBeDefined()
		expect(page2.data).toBeDefined()

		// Pages should have different data (unless there are fewer than 6 channels)
		if (page1.data.length === 3 && page2.data.length > 0) {
			expect(page1.data[0].id).not.toBe(page2.data[0].id)
		}
	})

	test('supports eq filter', async () => {
		const {data, error} = await query({
			table: 'channels',
			select: '*',
			limit: 1,
			page: 1,
			orderBy: 'created_at',
			filters: [{operator: 'eq', column: 'slug', value: 'ko002'}]
		})

		expect(error).toBeNull()
		expect(data).toBeDefined()
		if (data.length > 0) {
			expect(data[0].slug).toBe('ko002')
		}
	})

	test('supports ilike filter', async () => {
		const {data, error} = await query({
			table: 'channels',
			select: '*',
			limit: 5,
			page: 1,
			orderBy: 'created_at',
			filters: [{operator: 'ilike', column: 'slug', value: '%radio%'}]
		})

		expect(error).toBeNull()
		expect(data).toBeDefined()
		// All results should contain 'radio' in slug (case-insensitive)
		data.forEach((channel) => {
			expect(channel.slug.toLowerCase()).toContain('radio')
		})
	})

	test('supports order config ascending', async () => {
		const {data, error} = await query({
			table: 'channels',
			select: 'id, created_at',
			limit: 3,
			page: 1,
			orderBy: 'created_at',
			orderConfig: {ascending: true}
		})

		expect(error).toBeNull()
		expect(data).toBeDefined()
		// Check that results are in ascending order
		if (data.length >= 2) {
			const date1 = new Date(data[0].created_at)
			const date2 = new Date(data[1].created_at)
			expect(date1 <= date2).toBe(true)
		}
	})

	test('ignores unknown filter operators', async () => {
		const {data, error} = await query({
			table: 'channels',
			select: '*',
			limit: 5,
			page: 1,
			orderBy: 'created_at',
			filters: [{operator: 'malicious_function', column: 'slug', value: 'test'}]
		})

		// Query should still work, just ignoring the invalid filter
		expect(error).toBeNull()
		expect(data).toBeDefined()
	})
})

describe('supabaseOperators', () => {
	test('exports list of valid operators', () => {
		expect(Array.isArray(supabaseOperators)).toBe(true)
		expect(supabaseOperators).toContain('eq')
		expect(supabaseOperators).toContain('neq')
		expect(supabaseOperators).toContain('ilike')
		expect(supabaseOperators).toContain('textSearch')
	})
})
