[![Publish Package to npmjs](https://github.com/radio4000/sdk/actions/workflows/publish-to-npm-registry.yml/badge.svg)](https://github.com/radio4000/sdk/actions/workflows/publish-to-npm-registry.yml)

# @radio4000/sdk

A JavaScript SDK to interact with [Radio4000](https://radio4000.com) through a browser or node.js.

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

For all available methods, please see the source code for now: 

- [src/index.js](https://github.com/radio4000/sdk/blob/main/src/index.js).

## Contributing and development

If you'd like to help out, clone the repository, install dependencies and start the local server. The SDK itself is in the `./src` folder and the playground is in `./examples`.

```bash
git clone git@github.com:radio4000/sdk.git radio4000-sdk
cd radio4000-sdk
npm install
npm start
```
