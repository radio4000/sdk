/**
 * Playing around with the imports. This is just for testing
 */

// // Option 1
// import sdk  from '../src/index.js'
// sdk.signIn()
// sdk.createChannel()
// sdk.createTrack()

// Option 2
import {auth, channel, track} from '../src/index.js'
auth.signIn()
// channel.createChannel()
// track.createTrack()

// Option 3
// import {signIn} from '../src/auth.js'
// import {create as createChannel} from '../src/channel.js'
// import {create as createTrack} from '../src/track.js'
// auth.signIn()
// channel.create()
// track.create()
