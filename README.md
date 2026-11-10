[![Publish Package to npmjs](https://github.com/radio4000/sdk/actions/workflows/publish-to-npm-registry.yml/badge.svg)](https://github.com/radio4000/sdk/actions/workflows/publish-to-npm-registry.yml)

# @radio4000/sdk

A JavaScript SDK to interact with [Radio4000](https://radio4000.com) via a browser or node.js.  

It offers authentication as well as full create, read, update and delete of users, channels and tracks. While the SDK has many methods, remember you can always use `sdk.supabase` directly.

## Usage with a build system

```js
import {sdk} from '@radio4000/sdk'

const {data: channels, error} = await sdk.channels.readChannels()
if (error) throw new Error(error)
console.log(channels)
```

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

  await sdk.auth.signIn({email: '', password: ''})

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
npm test
npm start
```

The `.env` file is committed with the public Supabase anon key, so tests and builds work out of the box. To test CRUD operations, copy `.env.example` to `.env.local` and fill in `TEST_USER_EMAIL` and `TEST_USER_PASSWORD`.

## Overview

```
 Radio4000 SDK
  │
  ├── createSdk(supabaseClient) → SDK
  │
  ├── auth/
  │   ├── signUp({email, password, options?}) → Promise
  │   ├── signIn({email, password, options?}) → Promise
  │   ├── signOut() → Promise
  │   └── via sdk.supabase.auth:
  │       ├── signInWithOtp({email}) → Promise (magic link)
  │       └── signInWithOAuth({provider}) → Promise (google or facebook)
  │
  ├── users/
  │   ├── readUser() → Promise<{data?, error?}>
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
  ├── search/
  │   ├── parseQuery(text) → {channels, tags, mentions, text}
  │   ├── searchTracks(query | text, {limit?, offset?, order?, ascending?}) → Promise<{data: {tracks, count}, error?}>
  │   ├── searchChannels(text, {limit?, offset?}) → Promise<{data: {channels, count}, error?}>
  │   └── textSearchFilter(text) → string | null
  │
  ├── browse/
  │   ├── query({page?, limit?, table?, select?, orderBy?, orderConfig?, filters?}) → Promise
  │   ├── supabaseOperators: Array<string>
  │   └── supabaseOperatorsTable: Object
  │
  ├── extractTokens(text) → {tags: string[], mentions: string[]}
  ├── findTokens(text) → [{type, value, start, end}]
  │
  └── supabase (Supabase client instance)

  Almost every method returns the {data, error} format
```

### Search

`searchTracks('@ko002 #techno #acid mention:@alice detroit')` finds tracks from ko002 tagged both techno and acid, mentioning alice, and matching "detroit". `@slug` is a channel, `#tag` a tag, `mention:@slug` a mention, and the remaining words are full-text search. Every part narrows the result, and the database does the matching, paging and counting. Pass `{channels, tags, mentions, text}` instead of a string to skip parsing.

Tags and mentions follow the same rule as the database trigger that fills `tracks.tags` and `tracks.mentions` (`parse_tokens` in [radio4000/supabase](https://github.com/radio4000/supabase)): `#` or `@` at the start or after anything but a letter, digit, `_` or `&`, up to the next space, trailing punctuation cut, lowercased. `extractTokens(text)` applies it in JavaScript. Change both together.

### Generate types from database schema

```shell
npx supabase login
npx supabase gen types typescript --remote=SUPABASE_PROJECT_ID > src/database.types.ts
```

### Build system

We use [vite](https://vitejs.dev/) in library mode to bundle the project. The only reason we bundle is for usage directly in a browser environment without a bundler.

- dist/sdk.js (esm, good for browsers and newer node.js after cjs legacy)

Our package.json defines the `main`, `module` and `exports` fields to specify which file should be loaded in which environment. 

## How to release a new version

```
npm version [major/minor/patch] # updates version in package.json and creates a commit + tag
git push && git push --tags
```

This will trigger our GitHub workflow and publish to npm.
