// Meant to be run in the local server.
// const sdk = window.sdk
import sdk from '../src/index'

/**
 * Tests a few SDK methods by running and chaining them. This should always work.
 * Creates a new channel, queries it by slug, updates the name and validates it worked.
 * For now you need to pass it a user email and password.
 *
 * @param {string} slug - a new, unique slug for the channel to be created
 */
async function doTheTests(slug, {email, password}) {
	console.log('testing')
	const {data: {user}} = await sdk.signIn({email, password})
	await sdk.createChannel(user.id, {name: 'Radio Test', slug: slug})
	const {data: channel} = await sdk.findChannelBySlug(slug)
	await sdk.updateChannel(channel.id, {name: 'updated'})
	const {data: updatedChannel} = await sdk.findChannelBySlug(slug)
	console.log('same channel', channel.id === updatedChannel.id, )
	console.log('name field was updated', updatedChannel.name === 'updated')
	const {data: track} = sdk.createTrack(user.id, channel.id, {url: 'https://www.youtube.com/watch?v=dA55o_18a-g', title: 'My new track'})
	console.log('track was created', track.title === 'My new track')
}
