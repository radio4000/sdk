import {createClient} from '@supabase/supabase-js'
import {describe, expect, test} from 'vitest'
import {createSdk} from '../src/create-sdk.js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const sdk = createSdk(supabase)

describe('Firebase v1 methods', () => {
	test('sdk.firebase.readChannel returns raw Firebase data with firebase_id', async () => {
		const {data: channel, error} = await sdk.firebase.readChannel('detecteve')

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

	test('sdk.firebase.readTracks with slug returns raw Firebase tracks', async () => {
		const {data: tracks, error} = await sdk.firebase.readTracks({slug: 'detecteve'})

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

	test('sdk.firebase.readTracks with firebaseId returns same data as slug', async () => {
		const {data: channel} = await sdk.firebase.readChannel('detecteve')
		const {data: tracksBySlug} = await sdk.firebase.readTracks({slug: 'detecteve'})
		const {data: tracksByFbId} = await sdk.firebase.readTracks({
			firebaseId: channel.firebase_id
		})

		expect(tracksBySlug.length).toBe(tracksByFbId.length)
		expect(tracksBySlug[0].id).toBe(tracksByFbId[0].id)
	})

	test('sdk.firebase.parseChannel converts raw Firebase to v2 format', async () => {
		const {data: rawChannel} = await sdk.firebase.readChannel('detecteve')

		const parsed = sdk.firebase.parseChannel(rawChannel)

		expect(parsed.id).toBeDefined()
		expect(parsed.firebase_id).toBe(rawChannel.firebase_id)
		expect(parsed.slug).toBe('detecteve')
		expect(parsed.name).toBe(rawChannel.title) // title → name
		expect(parsed.description).toBe(rawChannel.body) // body → description
		expect(parsed.source).toBe('v1')
		expect(parsed.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
		expect(parsed.updated_at).toMatch(/^\d{4}-\d{2}-\d{2}T/)
	})

	test('sdk.firebase.parseTrack converts raw Firebase to v2 format', async () => {
		const {data: rawChannel} = await sdk.firebase.readChannel('detecteve')
		const {data: rawTracks} = await sdk.firebase.readTracks({slug: 'detecteve'})

		const parsed = sdk.firebase.parseTrack(rawTracks[0], 'test-channel-uuid', 'detecteve')

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
