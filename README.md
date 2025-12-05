[![Publish Package to npmjs](https://github.com/radio4000/sdk/actions/workflows/publish-to-npm-registry.yml/badge.svg)](https://github.com/radio4000/sdk/actions/workflows/publish-to-npm-registry.yml)

# @radio4000/sdk

A JavaScript SDK to interact with [Radio4000](https://radio4000.com) via a browser or node.js.  

It offers authentication as well as full create, read, update and delete of users, channels and tracks. While the SDK offers many convenient functions, but remember you can always do `sdk.supabase` and use the Supabase JS SDK directly as well.

## Browser usage via CDN

This example can be copy pasted into any HTML page. We read the latest five channels created.

```html
<script type="module">
  import {sdk} from 'https://cdn.jsdelivr.net/npm/@radio4000/sdk/+esm'

  const {data: channels, error} = await sdk.channels.readChannels(5)
  if (error) throw new Error(error.message)
  console.log(channels.map(c => c.name))
  // [object Array] (5) ["Radio Oskar","ko002","Radio Maretto","Samro","Good Time Radio"]
</script>
```

Here's another, where we sign in (use your own credentials), create a channel and a track.

```html
<script type="module">
  import {sdk} from 'https://cdn.jsdelivr.net/npm/@radio4000/sdk/+esm'
	
  sdk.auth.signIn({email: '', password: '')}
	
  const {data: channel, error} = await sdk.channels.createChannel({
    name: 'My radio',
    slug: 'my-radio',
    description: '...'
  })

  if (error) throw new Error(error.message)
	
  const {data: track} = await sdk.tracks.createTrack(channel.id, {
    url: 'http://...',
    title: 'Artist - Title',
    description: '...'
  })
</script>
```

## Usage with a build system

```js
import {sdk} from '@radio4000/sdk'

const {data: channels, error} = await sdk.channels.readChannels()
if (error) throw new Error(error)
console.log(channels)
```

### Using your own Supabase instance

The SDK by default connects to the main PostgreSQL maintained by Radio4000 (see `.env`). You can however use whichever you like. Note that the Supabase URL + (anon) Key are public, because we have postgres row policies in place.

```js
import {createClient} from '@supabase/supabase-js'
import {createSdk} from '@radio4000/sdk'

const supabase = createClient(url, key)
const sdk = createSdk(supabase)
```

## Contributing and development

If you'd like to help out, clone the repository, install dependencies and start the local server. The SDK itself is in the `./src` folder and the playground is in `./examples`.

```shell
git clone git@github.com:radio4000/sdk.git radio4000-sdk
cd radio4000-sdk
npm install
npm start
```

## Overview

```
 Radio4000 SDK
  │
  ├── createSdk(supabaseClient) → SDK
  │
  ├── auth/
  │   ├── signUp({email, password, options?}) → Promise
  │   ├── signIn({email, password, options?}) → Promise
  │   └── signOut() → Promise
  │
  ├── users/
  │   ├── readUser(jwtToken?) → Promise<{data?, error?}>
  │   └── deleteUser() → Promise
  │
  ├── channels/
  │   ├── createChannel({id?, name, slug, userId?}) → Promise<SupabaseResponse>
  │   ├── updateChannel(id, changes) → Promise<SupabaseResponse>
  │   ├── deleteChannel(id) → Promise
  │   ├── readChannel(slug) → Promise<SupabaseResponse>
  │   ├── readChannels(limit?) → Promise<SupabaseResponse>
  │   ├── readChannelTracks(slug, limit?) → Promise<SupabaseResponse>
  │   ├── readUserChannels() → Promise
  │   ├── canEditChannel(slug) → Promise<Boolean>
  │   ├── createImage(file, tags?) → Promise
  │   ├── followChannel(followerId, channelId) → Promise<SupabaseResponse>
  │   ├── unfollowChannel(followerId, channelId) → Promise<SupabaseResponse>
  │   ├── readFollowers(channelId) → Promise<SupabaseResponse>
  │   └── readFollowings(channelId) → Promise<SupabaseResponse>
  │
  ├── tracks/
  │   ├── createTrack(channelId, fields) → Promise<SupabaseResponse>
  │   ├── updateTrack(id, changes) → Promise<SupabaseResponse>
  │   ├── deleteTrack(id) → Promise
  │   ├── readTrack(id) → Promise<SupabaseResponse>
  │   └── canEditTrack(track_id) → Promise<Boolean>
  │
  ├── firebase/
  │   ├── readChannel(slug) → Promise<{data?, error?}>
  │   ├── readChannels({limit?}) → Promise<{data?, error?}>
  │   ├── readTracks({channelId?, slug?}) → Promise<{data?, error?}>
  │   ├── parseChannel(rawChannel) → v2Channel
  │   └── parseTrack(rawTrack, channelId, channelSlug) → v2Track
  │
  ├── search/
  │   ├── searchChannels(query, {limit?}) → Promise<{data?, error?}>
  │   ├── searchTracks(query, {limit?}) → Promise<{data?, error?}>
  │   └── searchAll(query, {limit?}) → Promise<{data: {channels, tracks}, error?}>
  │
  ├── browse/
  │   ├── query({page?, limit?, table?, select?, orderBy?, orderConfig?, filters?}) → Promise
  │   ├── supabaseOperators: Array<string>
  │   └── supabaseOperatorsTable: Object
  │
  ├── utils/
  │   └── extractTokens(str) → {mentions: string[], tags: string[]}
  │
  └── supabase (Supabase client instance)

  Almost every method returns the {data, error} format
```

### Generate types from database schema

```shell
npx supabase login
npx supabase gen types typescript --project-id SUPABASE_PROJECT_ID > src/database.types.ts
```

### Build system

We use [vite](https://vitejs.dev/) in library mode to bundle the project. The only reason we bundle is for usage directly in a browser environment without a bundler.

- dist/sdk.js (esm, good for browsers and newer node.js, dont want to bother with cjs legacy)

Our package.json defines the `main`, `module` and `exports` fields to specify which file should be loaded in which environment. 

## How to release a new version

Create a new, tagged release via the github.com website UI. This will trigger our GitHub workflow and publish to npm.
