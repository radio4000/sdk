[![Publish Package to npmjs](https://github.com/radio4000/sdk/actions/workflows/publish-to-npm-registry.yml/badge.svg)](https://github.com/radio4000/sdk/actions/workflows/publish-to-npm-registry.yml)

# @radio4000/sdk

A JavaScript SDK to interact with [Radio4000](https://radio4000.com) through a browser or node.js.  
It expects the SQL schema from [@radio4000/supabase](https://github.com/radio4000/supabase).

## Usage 

Depending on whether you have a build system or not, you can either import the module from NPM, from a CDN or download it locally.

All methods are available on the imported `sdk` module.

### With build system and NPM

```js
import sdk from '@radio4000/sdk'
```

### With browser via CDN

```html
<script type="module">
  import sdk from 'https://cdn.jsdelivr.net/npm/@radio4000/sdk/dist/index.min.js'
</script>
```

## API

For an up to date overview of available methods, please see the source code [src/index.js](https://github.com/radio4000/sdk/blob/main/src/index.js) for now.
.

- `sdk.supabase` - a pre-connected Supabase JS client to the R4 Supabase database

### Authentication

- `sdk.signUp({email, password})` - 
- `sdk.signIn({email, password})` - 
- `sdk.signOut()` - signs out any currently authenticated user

### Account

- `sdk.getUser()` - 
- `sdk.deleteUser()` - deletes the currently authenticated user along with their "user channels"

### Channels

- `sdk.createChannel({name, slug})` - 
- `sdk.updateChannel(id, changes)` - 
- `sdk.deleteChannel(id)` - deletes a channel
- `sdk.findChannels(limit)` - returns a list of channels
- `sdk.findUserChannels()` - finds channels from the authenticated user
- `sdk.findFirebaseChannelBySlug(slug)` - returns the channel
- `sdk.findChannelBySlug(slug)` - returns the channel
- `sdk.canEditChannel(slug)` - returns a promise boolean

### Tracks

- `sdk.findChannelTracks(slug)` - fetches maximum 3000 tracks by channel.slug
- `sdk.createTrack(channelId, fields)` - 
- `sdk.updateTrack(id, changes)` - 
- `sdk.deleteTrack(id)` - 
- `sdk.canEditTrack(id)` - returns a promise boolean

### Media provider

- `sdk.providers()` - 

## Contributing and development

If you'd like to help out, clone the repository, install dependencies and start the local server. The SDK itself is in the `./src` folder and the playground is in `./examples`.

```bash
git clone git@github.com:radio4000/sdk.git radio4000-sdk
cd radio4000-sdk
npm install
npm start
```
