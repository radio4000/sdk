[![Publish Package to npmjs](https://github.com/radio4000/sdk/actions/workflows/publish-to-npm-registry.yml/badge.svg)](https://github.com/radio4000/sdk/actions/workflows/publish-to-npm-registry.yml)

# @radio4000/sdk

A JavaScript SDK to interact with [Radio4000](https://radio4000.com) via a browser or node.js.  

It offers authentication as well as full create, read, update and delete of users, channels and tracks

## Browser usage via CDN

This example can be copy pasted into any HTML page. We read the latest five channels created.

```html
<script type="module">
  import {sdk} from 'https://cdn.jsdelivr.net/npm/@radio4000/sdk/+esm'

  const {data: channels, error} = await sdk.channels.readChannels(5)
  if (error) throw new Error(error.message)
  console.log(channels)
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

You're not limited to use the default Radio4000 supabase database. 

Supply your own like this:

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

Further development tips at the bottom.

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
  │   ├── createChannel({name, slug, userId?}) → Promise<ReturnObj>
  │   ├── updateChannel(id, changes) → Promise<ReturnObj>
  │   ├── deleteChannel(id) → Promise
  │   ├── readChannel(slug) → Promise<ReturnObj>
  │   ├── readChannels(limit?) → Promise<ReturnObj>
  │   ├── readChannelTracks(slug, limit?) → Promise<ReturnObj>
  │   ├── readUserChannels() → Promise
  │   ├── readFirebaseChannel(slug) → Promise<ReturnObj>
  │   ├── canEditChannel(slug) → Promise<Boolean>
  │   ├── createImage(file, tags?) → Promise
  │   ├── followChannel(followerId, channelId) → Promise<ReturnObj>
  │   ├── unfollowChannel(followerId, channelId) → Promise<ReturnObj>
  │   ├── readFollowers(channelId) → Promise<ReturnObj>
  │   └── readFollowings(channelId) → Promise<ReturnObj>
  │
  ├── tracks/
  │   ├── createTrack(channelId, fields) → Promise<ReturnObj>
  │   ├── updateTrack(id, changes) → Promise<ReturnObj>
  │   ├── deleteTrack(id) → Promise
  │   ├── readTrack(id) → Promise<{data?, error?}>
  │   └── canEditTrack(track_id) → Promise<Boolean>
  │
  ├── browse/
  │   ├── query({page?, limit?, table?, select?, orderBy?, orderConfig?, filters?}) → Promise
  │   ├── supabaseOperators: Array<string>
  │   └── supabaseOperatorsTable: Object
  │
  └── supabase (Supabase client instance)

  Types:
    • Channel: {name: string, slug: string, userId?: string, description?: string}
    • Track: {url: string, title: string, description?: string, discogs_url?: string}
    • ReturnObj: {data?: Object, error?: {code?: string, message: string}}
```

### Environment variables

This SDK connects to the main Radio4000 PostgreSQL database via Supabase. 

1. `cp .env.example .env`
2. Fill out the `.env` file

> Note that the Supabase URL + (anon) Key are public, because we have postgres row policies in place.

### Generate types from database schema

```shell
npx supabase login
npx supabase gen types typescript --project-id SUPABASE_PROJECT_ID > src/database.types.ts
```

### Build system

We use [vite](https://vitejs.dev/) in library mode to bundle the project. We output two files:

- dist/sdk.js (esm, good for browsers and newer node.js)

Our package.json defines the `main`, `module` and `exports` fields to specify which file should be loaded in which environment. 

## How to release a new version

Create a new, tagged release via the github.com website UI. That will trigger the GitHub action to publish to NPM.

