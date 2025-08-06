import { test, expect } from 'vitest'
import {sdk} from './_sdk-test.js'

// These tests are written with .serial. The order is important,
// as we create a new channel, add a track and crud it.

const random = new Date().getTime()
const name = `Radio Test ${random}`
const slug = `radio-test-${random}`

const validCredentials = {
	email: 'equal.note8933@fastmail.com',
	password: 'pass123'
}

const validCredentials2 = {
	email: 'equal.note8933+valid@fastmail.com',
	password: 'pass123'
}

test.skip('can create a new channel', async () => {
	const {
		data: {user},
		error
	} = await sdk.auth.signIn(validCredentials)
	if (error) {
		throw new Error(error.message)
	}
	const {data, error: err} = await sdk.channels.createChannel({name, slug, userId: user.id})
	if (err) {
		throw new Error(err.message)
	}
	expect(data.name).toBe(name)
	expect(data.slug).toBe(slug)
})

test.skip('can read a channel', async () => {
	const {data: channel, error} = await sdk.channels.readChannel(slug)
	if (error) throw new Error(error.message)
	expect(channel.name).toBe(name)
})

test.skip('can update channel', async () => {
	const {data: channel} = await sdk.channels.readChannel(slug)
	await sdk.channels.updateChannel(channel.id, {name: 'updated'})
	const {data: updatedChannel} = await sdk.channels.readChannel(slug)
	expect(channel.id).toBe(updatedChannel.id)
	expect(updatedChannel.name).toBe('updated')
})

test.skip('can create, update and delete track', async () => {
	const {data: channel} = await sdk.channels.readChannel(slug)
	const {data: track} = await sdk.tracks.createTrack(channel.id, {
		url: 'https://www.youtube.com/watch?v=dA55o_18a-g',
		title: 'My new track'
	})
	expect(track.title).toBe('My new track')

	const {data: tx} = await sdk.tracks.readTrack(track.id)
	expect(tx.title).toBe('My new track')

	const updatedAt = track.updated_at
	const {error: updateError} = await sdk.tracks.updateTrack(track.id, {
		url: 'https://radio4000.com',
		discogs_url: 'https://radio4000.com',
		title: 'updated',
		description: 'updated'
	})
	if (updateError) console.log(updateError)

	const {data: updated} = await sdk.tracks.readTrack(track.id)
	expect(updated.url).toBe('https://radio4000.com')
	expect(updated.discogs_url).toBe('https://radio4000.com')
	expect(updated.title).toBe('updated')
	expect(updated.description).toBe('updated')
	expect(updated.updated_at).not.toBe(updatedAt)

	await sdk.tracks.deleteTrack(track.id)
	const {error} = await sdk.tracks.readTrack(track.id)
	expect(error.code).toBe('PGRST116')
})

test.skip('can read and delete own channel', async () => {
	const {data} = await sdk.channels.readUserChannels()
	const len = data.length

	await sdk.channels.deleteChannel(data[0].id)

	const {error} = await sdk.channels.readChannel(data[0].slug)
	expect(error.code).toBe('PGRST116')

	const {data: newChannels} = await sdk.channels.readUserChannels()
	expect(newChannels.length).toBe(len - 1)
})

test.skip('can delete own user', async (t) => {})

// test.skip('read channels', async (t) => {
// 	const {data} = await sdk.channels.readChannels(2)
// 	t.is(data.length, 2)
// })

test.skip('channel slugs must be unique across supabase+firebase', async () => {
	const reservedSlug = 'oskar'
	const {error} = await sdk.channels.createChannel({name: 'Any', slug: reservedSlug})
	expect(error.code).toBe('slug-exists-firebase')
})

test.skip('can not write to data we are not supposed to', async () => {
	const {
		data: {user}
	} = await sdk.auth.signIn(validCredentials)
	expect(user.email).toBe(validCredentials.email)
	const {data: channel} = await sdk.channels.createChannel({
		name: 'Valid 1',
		slug: 'valid-1',
		userId: user.id
	})
	expect(channel.name).toBe('Valid 1')

	await sdk.auth.signOut()

	const {
		data: {user: user2}
	} = await sdk.auth.signIn(validCredentials2)
	expect(user2.email).toBe(validCredentials2.email)
	const {data: channel2} = await sdk.channels.createChannel({
		name: 'Valid 2',
		slug: 'valid-2',
		userId: user2.id
	})
	expect(channel2.name).toBe('Valid 2')

	await sdk.channels.updateChannel(channel2.id, {name: 'This should update'})
	const {data: updatedChannel2} = await sdk.channels.readChannel(channel2.slug)
	expect(updatedChannel2.name).toBe('This should update')

	const {data: updateData, error} = await sdk.channels.updateChannel(channel.id, {
		name: 'This should not update'
	})

	const {data: updatedChannel} = await sdk.channels.readChannel(channel.slug)
	expect(updatedChannel.name).toBe('Valid 1')

	// clean up
	await sdk.channels.deleteChannel(channel2.id)
	await sdk.auth.signIn(validCredentials)
	await sdk.channels.deleteChannel(channel.id)
})
