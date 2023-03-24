import test from 'ava'
import {assert} from 'console'
import sdk from '../src/index.js'

// These tests are written with .serial. The order is important,
// as we create a new channel, add a track and crud it.

const random = new Date().getTime()
const name = `Radio Test ${random}`
const slug = `radio-test-${random}`

const validCredentials = {
	email: 'equal.note8933@fastmail.com',
	password: 'pass123',
}

const validCredentials2 = {
	email: 'equal.note8933+valid@fastmail.com',
	password: 'pass123',
}

test.serial('can create a new channel', async (t) => {
	const {
		data: {user},
		error,
	} = await sdk.auth.signIn(validCredentials)
	if (error) {
		t.fail(error.message)
		return
	}
	const {data, error: err} = await sdk.channels.createChannel({name, slug, userId: user.id})
	if (err) {
		t.fail(err.message)
		return
	}
	t.is(data.name, name)
	t.is(data.slug, slug)
})

test.serial('can read a channel', async (t) => {
	const {data: channel, error} = await sdk.channels.readChannel(slug)
	if (error) t.fail(error.message)
	t.is(channel.name, name, 'can read channel by slug')
})

test.serial('can update channel', async (t) => {
	const {data: channel} = await sdk.channels.readChannel(slug)
	await sdk.channels.updateChannel(channel.id, {name: 'updated'})
	const {data: updatedChannel} = await sdk.channels.readChannel(slug)
	t.is(channel.id, updatedChannel.id)
	t.is(updatedChannel.name, 'updated')
})

test.serial('can create, update and delete track', async (t) => {
	const {data: channel} = await sdk.channels.readChannel(slug)
	const {data: track} = await sdk.tracks.createTrack(channel.id, {
		url: 'https://www.youtube.com/watch?v=dA55o_18a-g',
		title: 'My new track',
	})
	t.is(track.title, 'My new track', 'can create track')

	const {data: tx} = await sdk.tracks.readTrack(track.id)
	t.is(tx.title, 'My new track', 'can read track')

	const updatedAt = track.updated_at
	const {error: updateError} = await sdk.tracks.updateTrack(track.id, {
		url: 'https://radio4000.com',
		title: 'updated',
		description: 'updated',
	})
	if (updateError) console.log(updateError)

	const {data: updated} = await sdk.tracks.readTrack(track.id)
	t.is(updated.url, 'https://radio4000.com')
	t.is(updated.title, 'updated')
	t.is(updated.description, 'updated')
	t.not(updated.updated_at, updatedAt, 'updated timestamp was updated')

	await sdk.tracks.deleteTrack(track.id)
	const {error} = await sdk.tracks.readTrack(track.id)
	t.is(error.code, 'PGRST116')
})

test.serial('can read and delete own channel', async (t) => {
	let {data} = await sdk.channels.readUserChannels()
	const len = data.length

	await sdk.channels.deleteChannel(data[0].id)

	let {error} = await sdk.channels.readChannel(data[0].slug)
	t.is(error.code, 'PGRST116')

	let {data: newChannels} = await sdk.channels.readUserChannels()
	t.is(newChannels.length, len - 1)
})

test.skip('can delete own user', async (t) => {})

// test.skip('read channels', async (t) => {
// 	const {data} = await sdk.channels.readChannels(2)
// 	t.is(data.length, 2)
// })

test('channel slugs must be unique across supabase+firebase', async (t) => {
	const reservedSlug = 'oskar'
	const {error} = await sdk.channels.createChannel({name: 'Any', slug: reservedSlug})
	t.is(error.code, 'slug-exists-firebase')
})

test('can not write to data we are not supposed to', async (t) => {
	const {data: {user}} = await sdk.auth.signIn(validCredentials)
	t.is(user.email, validCredentials.email)
	const {data: channel} = await sdk.channels.createChannel({name: 'Valid 1', slug: 'valid-1', userId: user.id})
	t.is(channel.name, 'Valid 1')

	await sdk.auth.signOut()

	const {data: {user: user2}} = await sdk.auth.signIn(validCredentials2)
	t.is(user2.email, validCredentials2.email)
	const {data: channel2} = await sdk.channels.createChannel({name: 'Valid 2', slug: 'valid-2', userId: user2.id})
	t.is(channel2.name, 'Valid 2')

	await sdk.channels.updateChannel(channel2.id, {name: 'This should update'})
	const {data: updatedChannel2} = await sdk.channels.readChannel(channel2.slug)
	t.is(updatedChannel2.name, 'This should update')

	const {data: updateData, error} = await sdk.channels.updateChannel(channel.id, {name: 'This should not update'})
	console.log(updateData, error)

	const {data: updatedChannel} = await sdk.channels.readChannel(channel.slug)
	t.is(updatedChannel.name, 'Valid 1', 'name did not update')

	// clean up
	await sdk.channels.deleteChannel(channel2.id)
	await sdk.auth.signIn(validCredentials)
	await sdk.channels.deleteChannel(channel.id)
})
