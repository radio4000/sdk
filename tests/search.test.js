import {describe, expect, test} from 'vitest'
import '../src/main.js' // Initialize supabase client
import {parseQuery, searchChannels, searchTracks} from '../src/search.js'

describe('parseQuery', () => {
	test('splits channels, tags, mentions and text', () => {
		expect(parseQuery('@ko002 #Techno #acid, mention:@Alice detroit house')).toEqual({
			channels: ['ko002'],
			tags: ['techno', 'acid'],
			mentions: ['alice'],
			text: 'detroit house'
		})
	})

	test('keeps the order typed', () => {
		expect(parseQuery('#jazz #dub #ambient').tags).toEqual(['jazz', 'dub', 'ambient'])
	})

	test('keeps channel slugs as typed, minus trailing punctuation', () => {
		expect(parseQuery('@KO002, @baladas-80-1ToO').channels).toEqual(['KO002', 'baladas-80-1ToO'])
	})

	test('a mention is its leading slug, lowercased', () => {
		expect(parseQuery("mention:@Alice's mention:@rádio-latina!").mentions).toEqual([
			'alice',
			'rádio-latina'
		])
	})

	test('drops empty and duplicate tokens', () => {
		expect(parseQuery('  @ # #jazz #JAZZ mention:@ ')).toEqual({
			channels: [],
			tags: ['jazz'],
			mentions: [],
			text: ''
		})
	})

	test('empty input', () => {
		expect(parseQuery('')).toEqual({channels: [], tags: [], mentions: [], text: ''})
	})
})

describe('searchTracks', () => {
	test('every tag must match, with a true total', async () => {
		const {data, error} = await searchTracks({tags: ['techno', 'acid']}, {limit: 5})
		expect(error).toBeNull()
		expect(data.tracks).toHaveLength(5)
		expect(data.count).toBeGreaterThan(5)
		for (const t of data.tracks) expect(t.tags).toEqual(expect.arrayContaining(['techno', 'acid']))
	})

	test('pages are disjoint', async () => {
		const a = await searchTracks('#techno', {limit: 5})
		const b = await searchTracks('#techno', {limit: 5, offset: 5})
		const ids = new Set(a.data.tracks.map((t) => t.id))
		expect(b.data.tracks.some((t) => ids.has(t.id))).toBe(false)
		expect(b.data.count).toBe(a.data.count)
	})

	test('channel, tag and text together', async () => {
		const {data, error} = await searchTracks('@KO002 #house', {limit: 5})
		expect(error).toBeNull()
		expect(data.tracks.length).toBeGreaterThan(0)
		for (const t of data.tracks) {
			expect(t.slug).toBe('ko002')
			expect(t.tags).toContain('house')
		}
	})

	test('text alone, with prefix matching', async () => {
		const {data, error} = await searchTracks('aphe', {limit: 3})
		expect(error).toBeNull()
		expect(data.count).toBeGreaterThan(0)
	})

	test('websearch syntax and odd characters', async () => {
		for (const q of ['jazz or funk', 'electronic -techno', '"miles davis"', 'a,b (c)', ',()']) {
			const {error} = await searchTracks(q, {limit: 1})
			expect(error, q).toBeNull()
		}
	})

	test('slugs with capitals match in any case', async () => {
		const {data} = await searchTracks('@BALADAS-80-1too', {limit: 1})
		expect(data.count).toBeGreaterThan(0)
	})

	test('mentions', async () => {
		const {data, error} = await searchTracks('mention:@ko002', {limit: 3})
		expect(error).toBeNull()
		for (const t of data.tracks) expect(t.mentions).toContain('ko002')
	})

	test('orders by title', async () => {
		const {data} = await searchTracks('#techno', {limit: 5, order: 'title', ascending: true})
		const titles = data.tracks.map((t) => t.title)
		expect(titles).toEqual([...titles].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)))
	})

	test('nothing to search for returns nothing', async () => {
		expect(await searchTracks('')).toEqual({data: {tracks: [], count: 0}, error: null})
	})
})

describe('searchChannels', () => {
	test('finds a channel by slug', async () => {
		const {data, error} = await searchChannels('ko002')
		expect(error).toBeNull()
		expect(data.channels.some((c) => c.slug === 'ko002')).toBe(true)
	})

	test('empty query', async () => {
		expect(await searchChannels('')).toEqual({data: {channels: [], count: 0}, error: null})
	})
})
