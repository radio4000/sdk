# SDK File Review

Objective: Review every single file in `src` to identify improvements, type issues, and cleanup opportunities.

## Status: IN PROGRESS

## Files

- [ ] src/
  - [ ] auth.js
    - Antigravity: Simple wrappers. Missing explicit JSDoc return types. `options` is untyped `object`.
    - Claude: ✅ simplified, removed verbose typedefs 
  - [x] browse.js
    - Antigravity: Has `@ts-nocheck`. Logic is complex (dynamic filters). `table` cast to `any`.
    - Claude: ⏭️ skipped - dynamic `query[filter.operator]()` calls, keep @ts-nocheck 
  - [ ] channels.js
    - Antigravity: Heavily annotated. `createImage` has hardcoded credentials. `unwrapResponse` uses `@ts-ignore`.
    - Claude: 
  - [ ] create-sdk.js
    - Antigravity: Thin wrapper. Exports mutable `supabase`. `createSdk` factory.
    - Claude: 
  - [x] database.types.ts
    - Antigravity: Validation: Standard Supabase generation.
    - Claude: ✅ generated from supabase, don't touch 
  - [x] firebase.js
    - Antigravity: Legacy/Migration. `@ts-nocheck`. Hardcoded Firebase URL.
    - Claude: ✅ removed @ts-nocheck, added `FirebaseTrack` type, typed all functions 
  - [ ] main.ts
    - Antigravity: Re-exports from `sdk-default` and types.
    - Claude: 
  - [ ] sdk-default.js
    - Antigravity: Initializes Supabase client with env vars. Exports singleton SDK.
    - Claude: 
  - [x] search.js
    - Antigravity: `@ts-nocheck`. Uses `fts` column. Return types should be `SdkResult`.
    - Claude: ✅ removed @ts-nocheck, added `ChannelRow[]` and `ChannelTrack[]` return types 
  - [ ] tracks.js
    - Antigravity: Clean JSDoc. `createTrack` handles junction. `canEditTrack` mirrors channel logic.
    - Claude: 
  - [ ] types.test.ts
    - Antigravity: Manual type tests with `tsc`. Good coverage.
    - Claude: 
  - [x] types.ts
    - Antigravity: Central type definition. Clean.
    - Claude: ✅ source of truth for SDK types 
  - [ ] users.js
    - Antigravity: `readUser` wraps `auth.getUser`. `deleteUser` uses RPC.
    - Claude: 
  - [x] utils.js
    - Antigravity: `extractTokens` regex. Pure function.
    - Claude: ✅ removed @ts-nocheck, added `@type {string[]}` to arrays 
  - [x] vite-env.d.ts
    - Antigravity: Standard Vite types.
    - Claude: ✅ vite boilerplate, skip 
