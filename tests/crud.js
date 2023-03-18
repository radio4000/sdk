import test from 'ava'
import sdk from '../src/index.js'

const name = `Radio Test ${new Date().getTime()}`
const slug = `radio-test-${new Date().getTime()}`

const validCredentials = {
	email: 'equal.note8933@fastmail.com',
	password: 'helloworld',
}

test('channel slugs must be unique across supabase+firebase', async (t) => {
	const reservedSlug = 'oskar'
	const {error} = await sdk.channels.createChannel({name: 'Any', slug: reservedSlug})
	t.is(error.code, 'slug-exists-firebase')
})

test.serial('can create a new channel', async (t) => {
	const {
		data: {user},
	} = await sdk.auth.signIn(validCredentials)
	// console.log('Inserting new channel', user.id, name, slug)
	const {data, error} = await sdk.channels.createChannel({name, slug, userId: user.id})
	if (error) {
		t.fail(error.message)
		return
	}
	t.is(data.name, name)
})

test.serial('can read a channel', async (t) => {
	const {data: channel} = await sdk.channels.readChannel(slug)
	t.is(channel.name, name, 'can read channel by slug')
})

test.serial('can update channel', async (t) => {
	const {data: channel} = await sdk.channels.readChannel(slug)
	await sdk.channels.updateChannel(channel.id, {name: 'updated'})
	const {data: updatedChannel} = await sdk.channels.readChannel(slug)
	t.is(channel.id, updatedChannel.id)
	t.is(updatedChannel.name, 'updated', 'can update channel')
})

test.serial('can create track', async (t) => {
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
	console.log(updated)
	t.is(updated.url, 'https://radio4000.com')
	t.is(updated.title, 'updated')
	t.is(updated.description, 'updated')
	t.not(updated.updated_at, updatedAt, 'updated timestamp was updated')

	await sdk.tracks.deleteTrack(track.id)
	const {error} = await sdk.tracks.readTrack(track.id)
	t.is(error.code, 'PGRST116')
})

test.skip('can delete own channel', async (t) => {})
test.skip('can delete own user', async (t) => {})
test.skip('can delete track', async (t) => {})

test.serial('read channels', async (t) => {
	const {data} = await sdk.channels.readChannels(2)
	t.is(data.length, 2)
})
