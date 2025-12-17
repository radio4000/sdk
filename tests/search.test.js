import {describe, expect, test} from 'vitest'
import '../src/main.ts' // Initialize supabase client
import {searchChannels, searchTracks, searchAll} from '../src/search.js'

describe('searchChannels', () => {
	test('finds channel by name "detecteve"', async () => {
		const {data, error} = await searchChannels('detecteve')
		expect(error).toBeNull()
		expect(data).toBeDefined()
		expect(data.length).toBeGreaterThan(0)
		expect(data.some((c) => c.slug === 'detecteve')).toBe(true)
	})

	test('finds channel by name "ko002"', async () => {
		const {data, error} = await searchChannels('ko002')
		expect(error).toBeNull()
		expect(data).toBeDefined()
		expect(data.length).toBeGreaterThan(0)
		expect(data.some((c) => c.slug === 'ko002')).toBe(true)
	})

	test('returns empty array for empty query', async () => {
		const {data, error} = await searchChannels('')
		expect(error).toBeNull()
		expect(data).toEqual([])
	})

	test('respects limit option', async () => {
		const {data, error} = await searchChannels('radio', {limit: 2})
		expect(error).toBeNull()
		expect(data.length).toBeLessThanOrEqual(2)
	})
})

describe('searchTracks', () => {
	test('finds tracks with basic query', async () => {
		const {data, error} = await searchTracks('music', {limit: 10})
		expect(error).toBeNull()
		expect(data).toBeDefined()
		expect(data.length).toBeGreaterThan(0)
	})

	test('supports websearch OR syntax', async () => {
		const {data, error} = await searchTracks('jazz or funk', {limit: 10})
		expect(error).toBeNull()
		expect(data).toBeDefined()
		expect(data.length).toBeGreaterThan(0)
	})

	test('supports websearch negation syntax', async () => {
		const {data, error} = await searchTracks('electronic -techno', {limit: 10})
		expect(error).toBeNull()
		expect(data).toBeDefined()
	})

	test('returns empty array for empty query', async () => {
		const {data, error} = await searchTracks('')
		expect(error).toBeNull()
		expect(data).toEqual([])
	})
})

describe('searchAll', () => {
	test('returns both channels and tracks', async () => {
		const {data, error} = await searchAll('radio', {limit: 5})
		expect(error).toBeNull()
		expect(data).toBeDefined()
		expect(data.channels).toBeDefined()
		expect(data.tracks).toBeDefined()
	})

	test('returns empty results for empty query', async () => {
		const {data, error} = await searchAll('')
		expect(error).toBeNull()
		expect(data).toEqual({channels: [], tracks: []})
	})
})
