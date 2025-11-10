import {describe, expect, test} from 'vitest'
import * as firebase from '../src/firebase.js'

describe('Firebase v1 methods', () => {
	test('firebase.readChannel returns raw Firebase data with id', async () => {
		const {data: channel, error} = await firebase.readChannel('detecteve')

		expect(error).toBeUndefined()
		expect(channel.id).toBeDefined() // Firebase ID
		expect(channel.firebase_id).toBeUndefined() // Should not exist in raw data
		expect(channel.slug).toBe('detecteve')
		expect(channel.title).toBeDefined()
		expect(channel.created).toBeDefined()
	})

	test('firebase.readChannels returns all Firebase channels', async () => {
		const {data: channels, error} = await firebase.readChannels()

		console.log(`Total Firebase channels: ${channels.length}`)

		expect(error).toBeUndefined()
		expect(Array.isArray(channels)).toBe(true)
		expect(channels.length).toBeGreaterThan(0)
		expect(channels[0].id).toBeDefined()
		expect(channels[0].slug).toBeDefined()
	})

	test('firebase.readChannels respects limit parameter', async () => {
		const {data: channels} = await firebase.readChannels({limit: 5})

		expect(channels.length).toBe(5)
		expect(channels[0].id).toBeDefined()
	})

	test('firebase.readTracks returns raw Firebase data with id', async () => {
		const {data: tracks, error} = await firebase.readTracks({slug: 'detecteve'})

		expect(error).toBeUndefined()
		expect(Array.isArray(tracks)).toBe(true)
		expect(tracks.length).toBeGreaterThan(0)
		expect(tracks[0].id).toBeDefined() // Firebase ID
		expect(tracks[0].firebase_id).toBeUndefined() // Should not exist in raw data
		expect(tracks[0].url).toBeDefined()
	})

	test('firebase.readTracks with channelId returns same data as slug', async () => {
		const {data: channel} = await firebase.readChannel('detecteve')
		const {data: tracksBySlug} = await firebase.readTracks({slug: 'detecteve'})
		const {data: tracksByChannelId} = await firebase.readTracks({
			channelId: channel.id // Use the Firebase ID from raw channel
		})

		expect(tracksBySlug.length).toBe(tracksByChannelId.length)
		expect(tracksBySlug[0].id).toBe(tracksByChannelId[0].id)
	})

	test('firebase.parseChannel transforms v1 schema to v2', async () => {
		const {data: raw} = await firebase.readChannel('detecteve')
		const parsed = firebase.parseChannel(raw)

		// ID transformation: raw.id becomes firebase_id, new UUID as id
		expect(raw.id).toBeDefined() // Raw has Firebase ID
		expect(parsed.firebase_id).toBe(raw.id) // Moved to firebase_id
		expect(parsed.id).toMatch(/^[0-9a-f-]{36}$/) // New v2 UUID
		expect(parsed.id).not.toBe(raw.id) // Different IDs

		// Identity preservation
		expect(parsed.slug).toBe(raw.slug)

		// Field renames
		expect(parsed.name).toBe(raw.title)
		expect(parsed.description).toBe(raw.body)

		// Coordinate transforms
		if (raw.coordinatesLatitude) {
			expect(parsed.latitude).toBe(raw.coordinatesLatitude)
			expect(parsed.longitude).toBe(raw.coordinatesLongitude)
		}

		// Metadata
		expect(parsed.source).toBe('v1')
		expect(parsed.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
		expect(parsed.updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
	})

	test('firebase.parseTrack transforms v1 schema to v2', async () => {
		const {data: tracks} = await firebase.readTracks({slug: 'detecteve'})
		const raw = tracks[0]
		const parsed = firebase.parseTrack(raw, 'test-uuid', 'detecteve')

		// ID transformation: raw.id becomes firebase_id, new UUID as id
		expect(raw.id).toBeDefined() // Raw has Firebase ID
		expect(parsed.firebase_id).toBe(raw.id) // Moved to firebase_id
		expect(parsed.id).toMatch(/^[0-9a-f-]{36}$/) // New v2 UUID
		expect(parsed.id).not.toBe(raw.id) // Different IDs

		// Channel relationship
		expect(parsed.channel_id).toBe('test-uuid')
		expect(parsed.channel_slug).toBe('detecteve')

		// Field renames
		expect(parsed.title).toBe(raw.title)
		if (raw.body) expect(parsed.description).toBe(raw.body)
		if (raw.discogsUrl) expect(parsed.discogs_url).toBe(raw.discogsUrl)

		// Metadata
		expect(parsed.source).toBe('v1')
		expect(parsed.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
	})
})
