import {describe, expect, test, beforeAll, afterAll} from 'vitest'
import {supabase} from '../src/main.ts'
import {createTrack, updateTrack, deleteTrack} from '../src/tracks.js'
import {createChannel, deleteChannel, readChannelTracks} from '../src/channels.js'

const TEST_EMAIL = process.env.TEST_USER_EMAIL
const TEST_PASSWORD = process.env.TEST_USER_PASSWORD

const hasTestCredentials = TEST_EMAIL && TEST_PASSWORD

describe.skipIf(!hasTestCredentials)('Track fields (playback_error, duration)', () => {
	let channelId
	let trackId
	const testSlug = `test-channel-${Date.now()}`

	beforeAll(async () => {
		// Sign in
		const {error: authError} = await supabase.auth.signInWithPassword({
			email: TEST_EMAIL,
			password: TEST_PASSWORD
		})
		if (authError) throw authError

		// Create a test channel
		const {data: channel, error: channelError} = await createChannel({
			name: 'Test Channel',
			slug: testSlug
		})
		if (channelError) throw channelError
		channelId = channel.id
	})

	afterAll(async () => {
		// Clean up: delete track and channel
		if (trackId) await deleteTrack(trackId)
		if (channelId) await deleteChannel(channelId)
		await supabase.auth.signOut()
	})

	test('createTrack creates a track with basic fields', async () => {
		const {data: track, error} = await createTrack(channelId, {
			title: 'Test Track',
			url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
		})

		expect(error).toBeUndefined()
		expect(track).toBeDefined()
		expect(track.id).toBeDefined()
		expect(track.title).toBe('Test Track')
		trackId = track.id
	})

	test('updateTrack can set playback_error', async () => {
		const {data, error} = await updateTrack(trackId, {
			playback_error: 'Video unavailable'
		})

		expect(error).toBeNull()
		expect(data).toBeDefined()
		expect(data[0].playback_error).toBe('Video unavailable')
	})

	test('updateTrack can set duration', async () => {
		const {data, error} = await updateTrack(trackId, {
			duration: 212
		})

		expect(error).toBeNull()
		expect(data).toBeDefined()
		expect(data[0].duration).toBe(212)
	})

	test('updateTrack can set both playback_error and duration', async () => {
		const {data, error} = await updateTrack(trackId, {
			playback_error: 'Geo-restricted',
			duration: 180
		})

		expect(error).toBeNull()
		expect(data).toBeDefined()
		expect(data[0].playback_error).toBe('Geo-restricted')
		expect(data[0].duration).toBe(180)
	})

	test('readChannelTracks returns tracks with playback_error and duration', async () => {
		const {data: tracks, error} = await readChannelTracks(testSlug)

		expect(error).toBeNull()
		expect(tracks).toBeDefined()
		expect(tracks.length).toBeGreaterThan(0)

		const track = tracks.find((t) => t.id === trackId)
		expect(track).toBeDefined()
		expect(track.playback_error).toBe('Geo-restricted')
		expect(track.duration).toBe(180)
	})
})
