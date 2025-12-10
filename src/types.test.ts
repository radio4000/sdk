/**
 * Type verification file - run with `npx tsc --noEmit src/types.test.ts`
 *
 * Lines with @ts-expect-error SHOULD produce errors if types are correct.
 * If tsc reports "Unused '@ts-expect-error' directive" - the type is too loose!
 */

import {sdk} from './main.js'

async function verifyTypes() {
	// AUTH - options should be properly typed, not just `object`
	void (await sdk.auth.signUp({email: 'a@b.com', password: 'x', options: {}}))
	// @ts-expect-error options should reject string (currently accepts anything)
	void (await sdk.auth.signUp({email: 'a@b.com', password: 'x', options: 'bad'}))

	void (await sdk.auth.signIn({email: 'a@b.com', password: 'x', options: {}}))
	void (await sdk.auth.signOut())

	// USERS - readUser should return User type, not `object`
	const userResult = await sdk.users.readUser()
	// @ts-expect-error data should be User, not assignable to number
	const _bad: number = userResult.data

	void (await sdk.users.deleteUser())

	// CHANNELS
	void (await sdk.channels.createChannel({name: 'Test', slug: 'test'}))
	void (await sdk.channels.readChannel('slug'))
	void (await sdk.channels.readChannels())
	void (await sdk.channels.readUserChannels())
	void (await sdk.channels.readChannelTracks('slug'))
	void (await sdk.channels.canEditChannel('slug'))
	void (await sdk.channels.followChannel('a', 'b'))
	void (await sdk.channels.unfollowChannel('a', 'b'))
	void (await sdk.channels.readFollowers('id'))
	void (await sdk.channels.readFollowings('id'))

	// TRACKS
	void (await sdk.tracks.createTrack('id', {title: 'T', url: 'http://x'}))
	void (await sdk.tracks.updateTrack('id', {title: 'New'}))
	void (await sdk.tracks.deleteTrack('id'))
	void (await sdk.tracks.readTrack('id'))
	void (await sdk.tracks.canEditTrack('id'))

	// BROWSE
	void (await sdk.browse.query({table: 'channels', select: '*'}))

	// SUPABASE - should be typed with Database
	// @ts-expect-error nonexistent_table should error if Database types work
	void sdk.supabase.from('nonexistent_table').select()
	void sdk.supabase.from('channels').select()
}

export {verifyTypes}
