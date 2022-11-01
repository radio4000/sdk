[![Publish Package to npmjs](https://github.com/radio4000/sdk/actions/workflows/publish-to-npm-registry.yml/badge.svg)](https://github.com/radio4000/sdk/actions/workflows/publish-to-npm-registry.yml)

# @radio4000/sdk

A JavaScript SDK to interact with [Radio4000](https://radio4000.com) via a browser or node.js.  

It offers authentication as well as full create, read, update and delete of users, channels and tracks

## Usage 

There are two ways to import the sdk. Use whichever you prefer.

- import the default `sdk` object, where all methods are grouped into the modules `auth`, `users`, `channels` and `tracks`.
- import each method explicitly

### With browser via CDN

This example can be copy pasted into any HTML page. We sign in, create a channel and a track.

```html
<script type="module">
  import sdk, {createTrack} from 'https://cdn.jsdelivr.net/npm/@radio4000/sdk'
	
  sdk.auth.signIn({email: '', password: '')}
	
  const {data: channel} = await sdk.channels.createChannel({
    name: 'My radio',
    slug: 'my-radio',
    description: '...'
  })
	
  const {data: track} = createTrack(channel.id, {
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

## API

- https://radio4000.github.io/sdk/docs/

## Contributing and development

If you'd like to help out, clone the repository, install dependencies and start the local server. The SDK itself is in the `./src` folder and the playground is in `./examples`.

```bash
git clone git@github.com:radio4000/sdk.git radio4000-sdk
cd radio4000-sdk
npm install
npm start
```

### Generating docs from the source code

Using [typedoc](https://github.com/TypeStrong/typedoc) we can generate API docs from the source code. It will output to `./docs`.

- `npm run docs`
