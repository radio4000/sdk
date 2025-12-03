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

	test('firebase.readChannels returns Firebase channels', async () => {
		const {data: channels, error} = await firebase.readChannels({limit: 30})

		expect(error).toBeUndefined()
		expect(Array.isArray(channels)).toBe(true)
		expect(channels.length).toBe(30)
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

	test('firebase.parseChannel transforms v1 schema to v2 with deterministic UUID', async () => {
		const {data: raw} = await firebase.readChannel('detecteve')
		const parsed1 = firebase.parseChannel(raw)
		const parsed2 = firebase.parseChannel(raw)

		// ID transformation: raw.id becomes firebase_id, deterministic UUID as id
		expect(raw.id).toBeDefined() // Raw has Firebase ID
		expect(parsed1.firebase_id).toBe(raw.id) // Moved to firebase_id
		expect(parsed1.id).toMatch(/^[0-9a-f-]{36}$/) // v2 UUID format
		expect(parsed1.id).not.toBe(raw.id) // Different from Firebase ID

		// Deterministic: same input → same UUID
		expect(parsed1.id).toBe(parsed2.id)

		// Identity preservation
		expect(parsed1.slug).toBe(raw.slug)

		// Field renames
		expect(parsed1.name).toBe(raw.title)
		expect(parsed1.description).toBe(raw.body)

		// Coordinate transforms
		if (raw.coordinatesLatitude) {
			expect(parsed1.latitude).toBe(raw.coordinatesLatitude)
			expect(parsed1.longitude).toBe(raw.coordinatesLongitude)
		}

		// Metadata
		expect(parsed1.source).toBe('v1')
		expect(parsed1.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
		expect(parsed1.updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
	})

	test('firebase.parseTrack transforms v1 schema to v2 with deterministic UUID', async () => {
		const {data: tracks} = await firebase.readTracks({slug: 'detecteve'})
		const raw = tracks[0]
		const parsed1 = firebase.parseTrack(raw, 'test-uuid', 'detecteve')
		const parsed2 = firebase.parseTrack(raw, 'test-uuid', 'detecteve')

		// ID transformation: raw.id becomes firebase_id, deterministic UUID as id
		expect(raw.id).toBeDefined() // Raw has Firebase ID
		expect(parsed1.firebase_id).toBe(raw.id) // Moved to firebase_id
		expect(parsed1.id).toMatch(/^[0-9a-f-]{36}$/) // v2 UUID format
		expect(parsed1.id).not.toBe(raw.id) // Different from Firebase ID

		// Deterministic: same input → same UUID
		expect(parsed1.id).toBe(parsed2.id)

		// Channel relationship
		expect(parsed1.channel_id).toBe('test-uuid')
		expect(parsed1.slug).toBe('detecteve')

		// Field renames
		expect(parsed1.title).toBe(raw.title)
		if (raw.body) expect(parsed1.description).toBe(raw.body)
		if (raw.discogsUrl) expect(parsed1.discogs_url).toBe(raw.discogsUrl)

		// Metadata
		expect(parsed1.source).toBe('v1')
		expect(parsed1.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
	})
})
