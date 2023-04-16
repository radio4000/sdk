[![Publish Package to npmjs](https://github.com/radio4000/sdk/actions/workflows/publish-to-npm-registry.yml/badge.svg)](https://github.com/radio4000/sdk/actions/workflows/publish-to-npm-registry.yml)

# @radio4000/sdk

A JavaScript SDK to interact with [Radio4000](https://radio4000.com) via a browser or node.js.

It offers authentication as well as full create, read, update and delete of users, channels and tracks

## Usage

There are two ways to import the sdk. Use whichever you prefer.

- import the default `sdk` object. Here all methods are grouped into the modules `auth`, `users`, `channels` and `tracks`.
- import each method explicitly

You can see exactly what's possible here:

- https://sdk.radio4000.github.io/docs/

### With browser via CDN

This example can be copy pasted into any HTML page. We read the latest five channels created.

```html
<script type="module">
  import sdk from 'https://cdn.jsdelivr.net/npm/@radio4000/sdk'

  const {data: channels, error} = await sdk.channels.readChannels(5)
  if (error) throw new Error(error.message)
  console.log(channels)
</script>
```

Here's another, where we sign in (use your own credentials), create a channel and a track.

```html
<script type="module">
  import sdk, {createTrack} from 'https://cdn.jsdelivr.net/npm/@radio4000/sdk'

  sdk.auth.signIn({email: '', password: '')}

  const {data: channel, error} = await sdk.channels.createChannel({
    name: 'My radio',
    slug: 'my-radio',
    description: '...'
  })

  if (error) throw new Error(error.message)
	
  const {data: track} = await createTrack(channel.id, {
    url: 'http://...',
    title: 'Artist - Title',
    description: '...'
  })
</script>
```

### With build system and npm

```js
import sdk, {readChannels} from '@radio4000/sdk'

const {data: channels, error} = await readChannels()
if (error) throw new Error(error)
console.log(channels)
```

## Contributing and development

If you'd like to help out, clone the repository, install dependencies and start the local server. The SDK itself is in the `./src` folder and the playground is in `./examples`.

```shell
git clone git@github.com:radio4000/sdk.git radio4000-sdk
cd radio4000-sdk
npm install
npm start
```

## Environment variables

This SDK connects to the main Radio4000 PostgreSQL database via Supabase.

1. `cp .env.example .env`
2. Fill out the `.env` file

> Note that the Supabase URL + (anon) Key are public, because we have postgres row policies in place.

### Generating docs from the source code

Using [typedoc](https://github.com/TypeStrong/typedoc) we can generate API docs from the source code. It will output to `./docs`.

```shell
npm run docs
```

## Generate types from database schema

```shell
npx supabase login
npx supabase gen types typescript --project-id SUPABASE_PROJECT_ID > database.types.ts`
```
