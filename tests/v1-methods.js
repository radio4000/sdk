import {describe, expect, test} from 'vitest'
import * as firebase from '../src/firebase.js'

describe('Firebase v1 methods', () => {
	test('firebase.readChannel returns raw Firebase data with firebase_id', async () => {
		const {data: channel, error} = await firebase.readChannel('detecteve')

		expect(error).toBeUndefined()
		expect(channel).toBeDefined()
		expect(channel.slug).toBe('detecteve')
		expect(channel.title).toBeDefined() // Firebase has 'title' not 'name'
		expect(channel.firebase_id).toBeDefined()

		// Check what format the timestamps are in
		console.log('Channel fields:', Object.keys(channel))
		console.log('Channel timestamp fields:', {
			created: channel.created,
			updated: channel.updated
		})

		// Firebase should have 'created' not 'created_at'
		expect(channel.created).toBeDefined()
		expect(channel.updated).toBeDefined()
	})

	test('firebase.readTracks with slug returns raw Firebase tracks', async () => {
		const {data: tracks, error} = await firebase.readTracks({slug: 'detecteve'})

		expect(error).toBeUndefined()
		expect(tracks).toBeDefined()
		expect(Array.isArray(tracks)).toBe(true)
		expect(tracks.length).toBeGreaterThan(0)

		const firstTrack = tracks[0]
		console.log('Track fields:', Object.keys(firstTrack))
		console.log('Track timestamp fields:', {
			created: firstTrack.created,
			created_at: firstTrack.created_at,
			updated: firstTrack.updated,
			updated_at: firstTrack.updated_at
		})

		// Firebase tracks should have 'created', 'body', 'discogsUrl'
		expect(firstTrack.id).toBeDefined()
		expect(firstTrack.title).toBeDefined()
		expect(firstTrack.url).toBeDefined()
		expect(firstTrack.created).toBeDefined()
	})

	test('firebase.readTracks with firebaseId returns same data as slug', async () => {
		const {data: channel} = await firebase.readChannel('detecteve')
		const {data: tracksBySlug} = await firebase.readTracks({slug: 'detecteve'})
		const {data: tracksByFbId} = await firebase.readTracks({
			firebaseId: channel.firebase_id
		})

		expect(tracksBySlug.length).toBe(tracksByFbId.length)
		expect(tracksBySlug[0].id).toBe(tracksByFbId[0].id)
	})

	test('firebase.parseChannel converts raw Firebase to v2 format', async () => {
		const {data: rawChannel} = await firebase.readChannel('detecteve')

		const parsed = firebase.parseChannel(rawChannel)

		expect(parsed.id).toBeDefined()
		expect(parsed.firebase_id).toBe(rawChannel.firebase_id)
		expect(parsed.slug).toBe('detecteve')
		expect(parsed.name).toBe(rawChannel.title) // title → name
		expect(parsed.description).toBe(rawChannel.body) // body → description
		expect(parsed.source).toBe('v1')
		expect(parsed.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
		expect(parsed.updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
	})

	test('firebase.parseTrack converts raw Firebase to v2 format', async () => {
		const {data: rawChannel} = await firebase.readChannel('detecteve')
		const {data: rawTracks} = await firebase.readTracks({slug: 'detecteve'})

		const parsed = firebase.parseTrack(rawTracks[0], 'test-channel-uuid', 'detecteve')

		expect(parsed.id).toBeDefined()
		expect(parsed.firebase_id).toBe(rawTracks[0].id)
		expect(parsed.channel_id).toBe('test-channel-uuid')
		expect(parsed.channel_slug).toBe('detecteve')
		expect(parsed.title).toBe(rawTracks[0].title)
		expect(parsed.description).toBe(rawTracks[0].body || '') // body → description
		expect(parsed.discogs_url).toBe(rawTracks[0].discogsUrl || '') // discogsUrl → discogs_url
		expect(parsed.source).toBe('v1')
		expect(parsed.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
		expect(parsed.updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
	})
})
