import {describe, expect, test} from 'vitest'
import '../src/main.js' // Initialize supabase client
import {
	readChannel,
	readChannels,
	readChannelTracks,
	readFollowers,
	readFollowings,
	canEditChannel
} from '../src/channels.js'

describe('readChannel', () => {
	test('finds channel by slug', async () => {
		const {data, error} = await readChannel('ko002')
		expect(error).toBeNull()
		expect(data).toBeDefined()
		expect(data.slug).toBe('ko002')
	})

	test('returns error for non-existent slug', async () => {
		const {data, error} = await readChannel('this-channel-does-not-exist-xyz123')
		expect(error).toBeDefined()
		expect(data).toBeNull()
	})
})

describe('readChannels', () => {
	test('returns list of channels', async () => {
		const {data, error} = await readChannels(10)
		expect(error).toBeNull()
		expect(data).toBeDefined()
		expect(Array.isArray(data)).toBe(true)
		expect(data.length).toBeLessThanOrEqual(10)
	})

	test('respects limit parameter', async () => {
		const {data, error} = await readChannels(3)
		expect(error).toBeNull()
		expect(data.length).toBeLessThanOrEqual(3)
	})
})

describe('readChannelTracks', () => {
	test('returns tracks for a channel', async () => {
		const {data, error} = await readChannelTracks('ko002', 5)
		expect(error).toBeNull()
		expect(data).toBeDefined()
		expect(Array.isArray(data)).toBe(true)
	})

	test('returns error for missing slug', async () => {
		const {data, error} = await readChannelTracks('')
		expect(error).toBeDefined()
		expect(error.message).toBe('Missing channel slug')
	})

	test('respects limit parameter', async () => {
		const {data, error} = await readChannelTracks('ko002', 2)
		expect(error).toBeNull()
		expect(data.length).toBeLessThanOrEqual(2)
	})
})

describe('readFollowers', () => {
	test('returns array for valid channel id', async () => {
		// First get a channel to have a valid ID
		const {data: channel} = await readChannel('ko002')
		expect(channel).toBeDefined()

		const {data, error} = await readFollowers(channel.id)
		expect(error).toBeNull()
		expect(data).toBeDefined()
		expect(Array.isArray(data)).toBe(true)
	})

	test('returns empty array for channel with no followers', async () => {
		// Use a UUID that doesn't exist - should return empty array, not error
		const {data, error} = await readFollowers('00000000-0000-0000-0000-000000000000')
		expect(error).toBeNull()
		expect(data).toEqual([])
	})
})

describe('readFollowings', () => {
	test('returns array for valid channel id', async () => {
		const {data: channel} = await readChannel('ko002')
		expect(channel).toBeDefined()

		const {data, error} = await readFollowings(channel.id)
		expect(error).toBeNull()
		expect(data).toBeDefined()
		expect(Array.isArray(data)).toBe(true)
	})

	test('returns empty array for channel following no one', async () => {
		const {data, error} = await readFollowings('00000000-0000-0000-0000-000000000000')
		expect(error).toBeNull()
		expect(data).toEqual([])
	})
})

describe('canEditChannel', () => {
	test('returns false when not authenticated', async () => {
		const result = await canEditChannel('ko002')
		expect(result).toBe(false)
	})

	test('returns false for non-existent channel', async () => {
		const result = await canEditChannel('this-channel-does-not-exist-xyz123')
		expect(result).toBe(false)
	})
})
