# Multi-Client Adapter Architecture

This SDK supports multiple storage backends through an adapter pattern. You can use Supabase (default), browser localStorage, or implement your own custom adapter.

## Quick Start

### Using Supabase (Default - Backward Compatible)

```javascript
import {createClient} from '@supabase/supabase-js'
import {createSdk} from '@radio4000/sdk'

const supabase = createClient('https://your-project.supabase.co', 'your-anon-key')
const sdk = createSdk(supabase)

// Use normally
const {data: channels} = await sdk.channels.readChannels()
```

### Using Browser Storage (Local-First)

```javascript
import {createSdk} from '@radio4000/sdk'

// Create SDK with browser storage adapter
const sdk = createSdk({}, {adapter: 'browser'})

// All data is stored in localStorage!
await sdk.channels.createChannel({
  name: 'My Local Channel',
  slug: 'my-local-channel'
})

const {data: channels} = await sdk.channels.readChannels()
// Returns channels from localStorage
```

### Using Custom Configuration

```javascript
import {BrowserStorageAdapter} from '@radio4000/sdk/adapters'
import {createSdk} from '@radio4000/sdk'

// Create adapter with custom prefix
const adapter = new BrowserStorageAdapter({
  prefix: 'myapp',  // localStorage keys will be 'myapp:channels', etc.
})

const sdk = createSdk(adapter)
```

## Architecture Overview

```
User Code
    │
    ├─> createSdk(client, options)
    │       │
    │       ├─> Detects if client is already an adapter
    │       └─> If not, wraps it in appropriate adapter
    │
    └─> SDK Methods (channels, tracks, etc.)
            │
            └─> Use adapter.from('table').select()
                    │
                    ├─> SupabaseAdapter → Supabase API
                    ├─> BrowserStorageAdapter → localStorage
                    └─> YourCustomAdapter → Your backend
```

## Available Adapters

### 1. Supabase Adapter

**Type:** `'supabase'`

Production-ready PostgreSQL backend with real-time subscriptions, auth, and more.

```javascript
import {createClient} from '@supabase/supabase-js'
import {SupabaseAdapter} from '@radio4000/sdk/adapters'

const client = createClient(url, key)
const adapter = new SupabaseAdapter(client)

// Access raw Supabase client
adapter.raw.auth.signIn({email, password})
```

### 2. Browser Storage Adapter

**Type:** `'browser'`

Local-first storage using localStorage. Perfect for:
- Offline-first applications
- Prototyping without a backend
- Local development
- Privacy-focused apps

```javascript
import {BrowserStorageAdapter} from '@radio4000/sdk/adapters'

const adapter = new BrowserStorageAdapter({
  prefix: 'radio4000',  // localStorage key prefix
  storage: localStorage // or sessionStorage, or custom Storage API
})
```

**Features:**
- ✅ Full CRUD operations
- ✅ Basic auth (mock implementation)
- ✅ Querying: select, filter, order, limit
- ✅ Auto-generated IDs
- ✅ Timestamps (created_at, updated_at)
- ❌ No real-time subscriptions
- ❌ No server-side validation
- ❌ No relations/joins (returns empty nested objects)

**Data Storage:**

All data is stored as JSON in localStorage:

```
radio4000:channels = [{id: '1', name: 'Channel 1', ...}, ...]
radio4000:tracks = [{id: '1', title: 'Track 1', ...}, ...]
radio4000:session = {user: {...}, access_token: '...'}
```

### 3. Custom Adapter (Future: AT Protocol, IPFS, etc.)

Implement the `ClientAdapter` interface:

```javascript
import {BaseAdapter} from '@radio4000/sdk/adapters'

class AtProtoAdapter extends BaseAdapter {
  constructor(config) {
    super(config)
    this.type = 'atproto'
    // Initialize AT Protocol client
  }

  from(table) {
    return new AtProtoQueryBuilder(this, table)
  }

  get auth() {
    return {
      getSession: async () => { /* ... */ },
      signInWithPassword: async ({email, password}) => { /* ... */ },
      // ... other auth methods
    }
  }
}
```

## Migration Path

To migrate existing code to use adapters:

### Before (Current)

```javascript
// channels.js
import {supabase} from './main.js'

export const readChannels = async () => {
  return supabase.from('channels').select('*')
}
```

### After (Adapter-based)

```javascript
// channels.js
import {supabase} from './create-sdk.js' // Changed import path only!

export const readChannels = async () => {
  return supabase.from('channels').select('*') // Same code!
}
```

**That's it!** Just change the import from `'./main.js'` to `'./create-sdk.js'`.

## Use Cases

### Local Development

```javascript
// Use browser storage during development
const sdk = createSdk({}, {adapter: 'browser'})

// Populate with test data
await sdk.channels.createChannel({name: 'Test', slug: 'test'})
```

### Offline-First PWA

```javascript
// Primary: Supabase
const supabaseAdapter = new SupabaseAdapter(supabaseClient)
const onlineSdk = createSdk(supabaseAdapter)

// Fallback: Browser storage
const offlineAdapter = new BrowserStorageAdapter()
const offlineSdk = createSdk(offlineAdapter)

// Switch based on connectivity
const sdk = navigator.onLine ? onlineSdk : offlineSdk
```

### Multi-Tenant

```javascript
// Different tenants can use different backends
const tenant1Sdk = createSdk(supabase1Client)
const tenant2Sdk = createSdk(supabase2Client)
const tenant3Sdk = createSdk({}, {adapter: 'browser'})
```

### Testing

```javascript
// Use browser adapter for unit tests (no API calls)
import {test} from 'vitest'
import {createSdk} from '@radio4000/sdk'

test('creates channel', async () => {
  const sdk = createSdk({}, {adapter: 'browser'})

  const {data} = await sdk.channels.createChannel({
    name: 'Test',
    slug: 'test'
  })

  expect(data.name).toBe('Test')
})
```

## Adapter Interface

All adapters must implement:

```typescript
interface QueryBuilder {
  select(columns: string): QueryBuilder
  insert(data: Object): QueryBuilder
  update(data: Object): QueryBuilder
  delete(): QueryBuilder
  eq(column: string, value: any): QueryBuilder
  order(column: string, options?: {ascending: boolean}): QueryBuilder
  limit(count: number): QueryBuilder
  single(): QueryBuilder
  then(resolve, reject): Promise<{data: any, error: any}>
}

interface AuthAdapter {
  getSession(): Promise<{data: {session: any}}>
  signInWithPassword(credentials: {email: string, password: string}): Promise<{data: any, error: any}>
  signUp(credentials: Object): Promise<{data: any, error: any}>
  signOut(): Promise<{error: any}>
  onAuthStateChange(callback: Function): {data: {subscription: any}}
}

interface ClientAdapter {
  from(table: string): QueryBuilder
  auth: AuthAdapter
  type: string
}
```

## Roadmap

Future adapter implementations:

- **AT Protocol**: Store channels/tracks as AT Protocol records
- **IPFS**: Decentralized storage with content addressing
- **PouchDB/CouchDB**: Sync-capable local database
- **Dexie (IndexedDB)**: More robust browser storage
- **Firebase**: Alternative to Supabase
- **Custom REST API**: Generic HTTP adapter

## Performance Considerations

| Adapter | Network | Speed | Persistence | Real-time |
|---------|---------|-------|-------------|-----------|
| Supabase | Required | Medium | Server | Yes |
| Browser | None | Fast | Local only | No |
| AT Proto | Required | Medium | Distributed | Possible |

## FAQ

**Q: Can I use multiple adapters at once?**

A: Yes! Create multiple SDK instances:

```javascript
const remoteSdk = createSdk(supabaseClient)
const localSdk = createSdk({}, {adapter: 'browser'})

// Sync local to remote
const {data: localChannels} = await localSdk.channels.readChannels()
for (const channel of localChannels) {
  await remoteSdk.channels.createChannel(channel)
}
```

**Q: Do I need to change my existing code?**

A: No! The default behavior remains unchanged. Just change imports from `'./main.js'` to `'./create-sdk.js'` to enable adapter support.

**Q: Can browser storage handle large datasets?**

A: localStorage has a ~5-10MB limit. For larger datasets, consider implementing an IndexedDB adapter (Dexie).

**Q: How do I implement a custom adapter?**

A: Extend `BaseAdapter` and implement `from()` and `auth`. See `src/adapters/browser.js` for a complete example.

**Q: Will this work in Node.js?**

A: The browser adapter requires localStorage. In Node, you could:
- Use a localStorage polyfill (node-localstorage)
- Implement a filesystem-based adapter
- Use the Supabase adapter

## Examples

See the `examples/` directory for complete working examples:

- `examples/browser-storage.html` - Offline-first app
- `examples/multi-adapter.js` - Switching between adapters
- `examples/custom-adapter.js` - Implementing a custom adapter
