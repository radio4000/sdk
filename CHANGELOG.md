# Changelog

## v0.7.4 - 2026-02-05

- Replace media-url-parser with media-now, and parse v1

## v0.7.3 - 2026-02-03

- Update dependencies

## v0.7.2 - 2026-01-15

## v0.7.1 - 2026-01-15

- Typefixes in https://github.com/radio4000/sdk/pull/37

## v0.7.0 - 2026-01-14

- Websearch in https://github.com/radio4000/sdk/pull/36
- Improve types in https://github.com/radio4000/sdk/pull/35

## v0.6.5 - 2025-12-03

- Adds track `duration` and `playback_error` fields

## v0.6.4 - 2025-12-03

- Show npm version on docs page in https://github.com/radio4000/sdk/pull/31
- Make sure Firebase tracks+channels have deterministic uuid in https://github.com/radio4000/sdk/pull/32

## v0.6.3 - 2025-11-30

Channels now come with a `latest_track_at` date field.

## v0.6.2 - 2025-11-29

Fix release bug in 0.6.1

## v0.6.1 - 2025-11-29

Allow passing ID to createChannel() and createTrack(). This is useful for local-first scenarios where you're editing data offline.

## v0.6.0 - 2025-11-10

- New (for working with legacy v1 data) `sdk.firebase` methods in https://github.com/radio4000/sdk/pull/30
- Followers are now sorted properly in https://github.com/radio4000/sdk/pull/18

## v0.5.0 - 2025-11-08

- Switched linter, formatter to Biome in https://github.com/radio4000/sdk/pull/28
- New Search methods for channels and tracks in https://github.com/radio4000/sdk/pull/29

## v0.4.13 - 2025-08-06

- Better types https://github.com/radio4000/sdk/pull/27

## v0.4.12 - 2025-08-05

## v0.4.11 - 2024-05-11

## v0.4.10 - 2024-04-27

- add "hcaptcha" options for `auth.signIn` (seems required)

## v0.4.9 - 2024-04-27

- to `auth.signUp` add `options` as third argument (for hcaptcha)

## v0.4.8 - 2024-04-25

- Update publish git action (b1858b6)
- Upgrade npm-publish GitHub action (ebfe82f)

## v0.4.7 - 2024-04-23

- Fix build option (f6173e5)

## v0.4.6 - 2024-04-23

- The `sdk.channels.canEditChannel()` avoids one extra request #25 from radio4000/can-edit-improv (d8509fa)
- Updated all dependencies #24 from radio4000/update-dependencies (a446543)

## v0.4.5 - 2024-04-19

- fix github ci "shell env vars" from github org "config variables"

## v0.4.4 - 2024-04-18

- use .env to source the sdk default values of supabase "key" (public) and "url"

## v0.4.3 - 2023-08-05

Just an update of dependencies.

## v0.4.2 - 2023-05-29

- adds sdk.browse.query() in the src/browse file; so "end user" can generate a full supabase.from query
- add src/browse.js for methods relating to building user def queries in https://github.com/radio4000/sdk/pull/17

## v0.4.1 - 2023-05-10

- Fix types https://github.com/radio4000/sdk/pull/14

## v0.4.0 - 2023-05-10

- add channels.{follow,unfollow}Channel & read{Followers,Followings} in https://github.com/radio4000/sdk/pull/16

## v0.3.5 - 2023-05-09

- fix create track.discogs_url in https://github.com/radio4000/sdk/pull/15

## v0.3.4 - 2023-04-18

## v0.3.1 - 2023-04-18

Forgot to update package.json in 0.3.0

## v0.3.0 - 2023-04-18

The exports changed. The default export has been removed, and we have two named ones: `import {sdk, createSdk} from '@radio4000/sdk'`. See Update build in https://github.com/radio4000/sdk/pull/13.

Switched build from esbuild to vite (which also uses esbuild), but allows us to have a nicer dev server.

## v0.2.0 - 2023-04-14

## v0.1.6 - 2023-03-25

## v0.1.5 - 2023-03-24

## v0.1.4 - 2023-03-24

Attempt to fix the build process, trouble with env vars

## v0.1.3 - 2023-03-24

### New tests

Added tests for authentication and most CRUD for channels + tracks using the SDK methods.

Possibly the `sql` test doesn't belong in this repo. Could move this part to `supabase` repo.

### Env vars

Also switched the `supabase-client.js` to read the config from env variables, but it's commented out for now, because I'm not sure how this integrates with the CI. It worked for build.

That being said, once we `cp .env.example .env` and uncomment the code it works.

### `createChannel()` now takes an optional `userId`

... for the channel to be created. If not supplied, we fall back to the session user. If no session user, we throw an error.

## v0.1.2 - 2022-11-01

## v0.1.1 - 2022-10-31

## v0.1.0 - 2022-10-31

This release changes the exports from this module.

See https://radio4000.github.io/sdk/docs/

## v0.0.21 - 2022-10-22

## v0.0.20 - 2022-10-22

## v0.0.19 - 2022-10-22

## v0.0.18 - 2022-10-22

## v0.0.17 - 2022-10-22

## v0.0.16 - 2022-10-22

## v0.0.15 - 2022-10-22

## v0.0.14 - 2022-10-22

## v0.0.13 - 2022-10-22

## v0.0.12 - 2022-10-22

## v0.0.11 - 2022-10-21

## v0.0.10 - 2022-10-21
