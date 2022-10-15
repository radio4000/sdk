[![Publish Package to npmjs](https://github.com/radio4000/sdk/actions/workflows/publish-to-npm-registry.yml/badge.svg)](https://github.com/radio4000/sdk/actions/workflows/publish-to-npm-registry.yml)

# sdk
a javascript SDK (using supabase) to interact with radio4000 (browser,node)

# development

Should work in `browser`, `node`, `deno`, `bun`

```bash
npx serve .
node --experimental-network-imports src/index.js
bun run src/index.js
# deno run src/index.js # not working with network (cdn) modules
```
