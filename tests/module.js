/**
 * Playing around with the imports. This is just for testing
 */

// // Option 1
// import sdk  from '../src/index.js'
// sdk.signIn()
// sdk.createChannel()
// sdk.createTrack()

// Option 2
import {auth, channels, tracks} from '../src/index.js'
auth.signIn()
// channels.createChannel()
// tracks.createTrack()

// Option 3
// import {signIn} from '../src/auth.js'
// import {create as createChannel} from '../src/channels.js'
// import {create as createTrack} from '../src/tracks.js'
// auth.signIn()
// createChannel()
// createTrack()
