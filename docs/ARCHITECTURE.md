# Radio4000 SDK - Multi-Client Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Application                          │
└────────────────────────────┬──────────────────────────────────────┘
                             │
                             │ import {createSdk}
                             │
┌────────────────────────────▼──────────────────────────────────────┐
│                         createSdk()                                │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │  Detects client type & wraps in appropriate adapter          │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────┬──────────────────────────────────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              │         Adapter Layer        │
              │                             │
    ┌─────────▼──────────┐    ┌─────────────▼────────────┐
    │ SupabaseAdapter    │    │ BrowserStorageAdapter    │
    │                    │    │                          │
    │ - from()           │    │ - from()                 │
    │ - auth             │    │ - auth (mock)            │
    │ - type: 'supabase' │    │ - type: 'browser'        │
    └─────────┬──────────┘    └─────────────┬────────────┘
              │                             │
              │                             │
    ┌─────────▼──────────┐    ┌─────────────▼────────────┐
    │  QueryBuilder      │    │  BrowserQueryBuilder     │
    │                    │    │                          │
    │  - select()        │    │  - select()              │
    │  - insert()        │    │  - insert()              │
    │  - update()        │    │  - update()              │
    │  - delete()        │    │  - delete()              │
    │  - eq(), order()   │    │  - eq(), order()         │
    │  - limit(), single()│    │  - limit(), single()     │
    └─────────┬──────────┘    └─────────────┬────────────┘
              │                             │
              │                             │
    ┌─────────▼──────────┐    ┌─────────────▼────────────┐
    │   Supabase API     │    │     localStorage         │
    │                    │    │                          │
    │  - PostgreSQL      │    │  Key-value store:        │
    │  - Auth            │    │  radio4000:channels      │
    │  - Real-time       │    │  radio4000:tracks        │
    │  - Storage         │    │  radio4000:session       │
    └────────────────────┘    └──────────────────────────┘
```

## Data Flow

### 1. Creating SDK Instance

```
User Code                           createSdk()                      Adapter
─────────────────────────────────────────────────────────────────────────────

createSdk(supabaseClient)    ──▶    client.type exists?
                                           │
                                           ├─ Yes ──▶ Use as-is
                                           │
                                           └─ No ───▶ createAdapter()
                                                           │
                                                           ├─ 'supabase'
                                                           │  new SupabaseAdapter(client)
                                                           │
                                                           └─ 'browser'
                                                              new BrowserStorageAdapter()

                                    ◀─── Returns adapter

sdk.channels.createChannel()  ──▶  Uses adapter.from('channels')
```

### 2. Query Execution (Browser Storage)

```
SDK Method                    Adapter                           Storage
──────────────────────────────────────────────────────────────────────────

sdk.channels.createChannel()
    │
    ├─▶ adapter.from('channels')
    │       │
    │       └─▶ new BrowserQueryBuilder()
    │               │
    ├─▶ .insert({name, slug})
    │       │
    │       └─▶ Sets query.operation = 'insert'
    │           Sets query.data = {name, slug}
    │
    ├─▶ .select()
    │       │
    │       └─▶ Sets query.needsSelect = true
    │
    └─▶ .single()
            │
            └─▶ Sets query.single = true
                Triggers execution (thenable)
                    │
                    ├─▶ _executeInsert()
                    │       │
                    │       ├─▶ Generate ID
                    │       ├─▶ Add timestamps
                    │       ├─▶ Save to localStorage
                    │       │       │
                    │       │       └─▶ localStorage.setItem(
                    │       │              'radio4000:channels',
                    │       │              JSON.stringify([...])
                    │       │           )
                    │       │
                    │       └─▶ Return {data, error}
                    │
                    └─▶ Return to user
```

### 3. Query Execution (Supabase)

```
SDK Method                    Adapter                    Supabase
────────────────────────────────────────────────────────────────────

sdk.channels.createChannel()
    │
    ├─▶ adapter.from('channels')
    │       │
    │       └─▶ supabase.from('channels')
    │               │
    │               └─▶ Supabase QueryBuilder
    │                       │
    ├─▶ .insert({name, slug})
    │       │
    │       └─▶ Supabase handles
    │
    ├─▶ .select()
    │       │
    │       └─▶ Supabase handles
    │
    └─▶ .single()
            │
            └─▶ Supabase handles
                    │
                    └─▶ HTTP POST to Supabase API
                            │
                            ├─▶ PostgreSQL INSERT
                            ├─▶ Row-level security
                            ├─▶ Triggers/functions
                            │
                            └─▶ Return {data, error}
```

## Component Responsibilities

### createSdk()
**Location:** `src/create-sdk.js`

**Responsibilities:**
- Accept any client or adapter
- Detect if wrapping needed
- Call adapter factory
- Return SDK object with all modules

**Input:** Client or Adapter
**Output:** SDK object

### Adapters
**Location:** `src/adapters/`

**Responsibilities:**
- Implement standard interface
- Translate SDK calls to backend calls
- Handle auth
- Return consistent response format

**Interface:**
```javascript
{
  from(table): QueryBuilder
  auth: {
    getSession()
    signInWithPassword()
    signUp()
    signOut()
    onAuthStateChange()
  }
  type: string
}
```

### Query Builders

**Responsibilities:**
- Provide fluent API
- Build query object
- Execute query when awaited (thenable)
- Return `{data, error}` format

**Methods:**
```javascript
select(columns)
insert(data)
update(data)
delete()
eq(column, value)
order(column, options)
limit(count)
single()
```

### SDK Modules
**Location:** `src/channels.js`, `src/tracks.js`, etc.

**Responsibilities:**
- Business logic
- Validation
- Compose queries
- Return results

**Example:**
```javascript
export const createChannel = async ({name, slug}) => {
  // Validation
  if (!slug) return {error: 'Missing slug'}

  // Use adapter (agnostic to backend)
  const result = await supabase
    .from('channels')
    .insert({name, slug})
    .select()
    .single()

  return result
}
```

## Adapter Comparison

| Feature | SupabaseAdapter | BrowserStorageAdapter |
|---------|----------------|----------------------|
| **Backend** | PostgreSQL | localStorage |
| **Network** | Required | None |
| **Auth** | Full OAuth/JWT | Mock only |
| **Queries** | Full SQL | Basic filter/sort |
| **Real-time** | ✅ Yes | ❌ No |
| **Relations** | ✅ Joins | ❌ No |
| **Validation** | ✅ Server-side | ❌ Client only |
| **Storage** | Unlimited | ~5-10MB |
| **Speed** | ~100-200ms | <1ms |
| **Offline** | ❌ No | ✅ Yes |
| **Cost** | Scales with usage | Free |

## Extension Points

### Adding New Adapter

1. **Create adapter class**
```javascript
// src/adapters/mybackend.js
import {BaseAdapter} from './interface.js'

export class MyBackendAdapter extends BaseAdapter {
  constructor(config) {
    super(config)
    this.type = 'mybackend'
  }

  from(table) {
    return new MyBackendQueryBuilder(this, table)
  }

  get auth() {
    // Implement auth methods
  }
}
```

2. **Implement query builder**
```javascript
class MyBackendQueryBuilder {
  select(columns) { /* ... */ }
  insert(data) { /* ... */ }
  // ... other methods

  async then(resolve, reject) {
    // Execute query
    // Return {data, error}
  }
}
```

3. **Register in factory**
```javascript
// src/adapters/index.js
import {MyBackendAdapter} from './mybackend.js'

export function createAdapter(type, config) {
  switch (type) {
    case 'mybackend':
      return new MyBackendAdapter(config)
    // ...
  }
}
```

4. **Use it**
```javascript
import {createSdk} from '@radio4000/sdk'

const sdk = createSdk(myConfig, {adapter: 'mybackend'})
```

## Future Architecture

### Planned Adapters

```
┌─────────────────────────────────────────────┐
│              createSdk()                     │
└───────────────────┬─────────────────────────┘
                    │
        ┌───────────┼───────────┬──────────────┐
        │           │           │              │
   ┌────▼────┐ ┌───▼────┐ ┌────▼─────┐  ┌────▼─────┐
   │Supabase │ │Browser │ │AT Protocol│  │  IPFS    │
   └────┬────┘ └───┬────┘ └────┬─────┘  └────┬─────┘
        │          │           │              │
   ┌────▼────┐ ┌───▼────┐ ┌────▼─────┐  ┌────▼─────┐
   │   SQL   │ │LocalStr│ │Bluesky   │  │Distributed│
   │Database │ │ -age   │ │Network   │  │  Storage  │
   └─────────┘ └────────┘ └──────────┘  └───────────┘
```

### Multi-Adapter Support

```javascript
// Hybrid approach: local + remote
const localAdapter = new BrowserStorageAdapter()
const remoteAdapter = new SupabaseAdapter(client)

// Write to both
await localAdapter.from('channels').insert(data)
await remoteAdapter.from('channels').insert(data)

// Read from local first (fast)
let {data} = await localAdapter.from('channels').select()
if (!data.length) {
  // Fallback to remote
  ({data} = await remoteAdapter.from('channels').select())
}
```

### Sync Layer (Future)

```
┌─────────────────────────────────────────┐
│           Sync Manager                  │
│                                         │
│  ┌────────────────────────────────┐    │
│  │  Conflict Resolution Strategy   │    │
│  └────────────────────────────────┘    │
└───────────┬─────────────┬───────────────┘
            │             │
     ┌──────▼──────┐ ┌───▼────────┐
     │   Local     │ │   Remote   │
     │  Adapter    │ │  Adapter   │
     └─────────────┘ └────────────┘
```

## Summary

The adapter architecture provides:

✅ **Separation of concerns** - Business logic independent of storage
✅ **Flexibility** - Easy to add new backends
✅ **Testability** - Mock storage for tests
✅ **Performance** - Choose fast local or robust remote
✅ **Offline-first** - Build apps that work without connectivity
✅ **Progressive enhancement** - Start local, upgrade to cloud

All while maintaining a simple, consistent API that developers already know.
