// Meant to be run in the local server.
const sdk = window.sdk

/**
 * Tests a few SDK methods by running and chaining them. This should always work.
 * Creates a new channel, queries it by slug, updates the name and validates it worked.
 * For now you need to pass it a user email and password.
 *
 * @param {string} slug - a new, unique slug for the channel to be created
 * @param {object} user
 * @param {string} user.email
 * @param {string} user.password
 */
async function testChannels(slug, {email, password}) {
	console.log('testing')
	const {data: {user}} = await sdk.signIn({email, password})
	await sdk.createChannel({name: 'Radio Test', slug: slug}, {id: user.id})
	const {data: channel} = await sdk.findChannelBySlug(slug)
	await sdk.updateChannel(channel.id, {name: 'updated'})
	const {data: updatedChannel} = await sdk.findChannelBySlug(slug)
	console.log('same channel', channel.id === updatedChannel.id, )
	console.log('name field was updated', updatedChannel.name === 'updated')
}