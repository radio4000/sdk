import {supabase} from './create-sdk.js'
import {extractTokens} from './utils.js'

/**
 * @typedef {import('./types').Channel} Channel
 * @typedef {import('./types').Track} Track
 */

/**
 * @template T
 * @typedef {import('./types').SdkResult<T>} SdkResult
 */

/**
 * What to find. Every part narrows the result; leave out what you don't need.
 * @typedef {Object} TrackQuery
 * @property {string[]} [channels] - Channel slugs, any case; tracks from any of them
 * @property {string[]} [tags] - Tracks with all of these tags
 * @property {string[]} [mentions] - Tracks mentioning all of these slugs
 * @property {string} [text] - Full-text search over title and description
 */

/**
 * Read a search string: `@slug` is a channel, `#tag` a tag, `mention:@slug` a
 * mention, and the remaining words are free text. Tags and mentions follow the
 * same rule as the database, so `#Techno,` finds tracks tagged `techno`.
 * @param {string} input
 * @returns {Required<TrackQuery>}
 * @example
 * parseQuery('@ko002 #Techno #acid mention:@alice detroit')
 * // => {channels: ['ko002'], tags: ['techno', 'acid'], mentions: ['alice'], text: 'detroit'}
 */
export function parseQuery(input) {
	/** @type {Set<string>} */ const channels = new Set()
	/** @type {Set<string>} */ const tags = new Set()
	/** @type {Set<string>} */ const mentions = new Set()
	/** @type {string[]} */ const words = []
	for (const word of (input ?? '').trim().split(/\s+/).filter(Boolean)) {
		if (word.toLowerCase().startsWith('mention:@')) {
			for (const m of extractTokens(word.slice('mention:'.length)).mentions) mentions.add(m)
		} else if (word.startsWith('@')) {
			// Slugs are free-form ("Cocoa Beach", "rádio"), so keep the word as typed.
			const slug = word.slice(1)
			if (slug) channels.add(slug)
		} else if (word.startsWith('#') || word.startsWith('＃')) {
			for (const t of extractTokens(word).tags) tags.add(t)
		} else {
			words.push(word)
		}
	}
	return {channels: [...channels], tags: [...tags], mentions: [...mentions], text: words.join(' ')}
}

/** Characters that break PostgREST's filter syntax. */
const FILTER_CHARS = /[,()&|!*"\\]/g

/** Quote a value for a PostgREST filter, so commas and brackets in it are literal. */
const quote = (/** @type {string} */ value) => `"${value.replace(/["\\]/g, '\\$&')}"`
const WEBSEARCH_SYNTAX = /\bor\b|^-|\s-|"/i

/**
 * Full-text filter for PostgREST's `or()`: websearch syntax (`jazz or funk`,
 * `-techno`, `"exact phrase"`) plus prefix matching, so `detr` finds `detroit`.
 * @param {string} text
 * @returns {string | null}
 */
export function textSearchFilter(text) {
	const hasSyntax = WEBSEARCH_SYNTAX.test(text)
	const safe = text.replace(FILTER_CHARS, ' ').replace(/\s+/g, ' ').trim()
	if (!safe) return null
	const filters = [`fts.wfts.${safe}`]
	if (!hasSyntax) {
		const words = safe
			.split(' ')
			.map((w) => w.replace(/[^\p{L}\p{N}]/gu, ''))
			.filter(Boolean)
		if (words.length) filters.push(`fts.fts.${words.map((w) => `${w}:*`).join(' & ')}`)
	}
	return filters.join(',')
}

/**
 * Find tracks across all channels. Matching, ordering, paging and counting all
 * happen in the database, so `count` is the true total.
 * @param {TrackQuery | string} query - A {@link TrackQuery}, or a search string for {@link parseQuery}
 * @param {{limit?: number, offset?: number, order?: 'created_at' | 'updated_at' | 'title', ascending?: boolean}} [options] - Newest first by default
 * @returns {Promise<SdkResult<{tracks: Track[], count: number}>>}
 */
export async function searchTracks(
	query,
	{limit = 50, offset = 0, order = 'created_at', ascending = false} = {}
) {
	const {channels, tags, mentions, text} = typeof query === 'string' ? parseQuery(query) : query
	const filter = text?.trim() ? textSearchFilter(text) : null
	if (!channels?.length && !tags?.length && !mentions?.length && !filter) {
		return {data: {tracks: [], count: 0}, error: null}
	}
	let request = supabase.from('channel_tracks').select('*', {count: 'exact'})
	if (channels?.length) {
		// Slugs are unique ignoring case; ilike makes "@KO002" find ko002.
		const slugs = channels.map((c) => `slug.ilike.${quote(c.replace(/[\\%_]/g, '\\$&'))}`)
		request = request.or(slugs.join(','))
	}
	if (tags?.length) request = request.contains('tags', tags)
	if (mentions?.length) request = request.contains('mentions', mentions)
	if (filter) request = request.or(filter)
	const {data, error, count} = await request
		.order(order, {ascending})
		.order('id')
		.range(offset, offset + limit - 1)
	if (error) return {data: null, error}
	return {data: {tracks: /** @type {Track[]} */ (data ?? []), count: count ?? 0}, error: null}
}

/**
 * Find channels by name, slug or description, newest activity first.
 * @param {string} text
 * @param {{limit?: number, offset?: number}} [options]
 * @returns {Promise<SdkResult<{channels: Channel[], count: number}>>}
 */
export async function searchChannels(text, {limit = 50, offset = 0} = {}) {
	const filter = text?.trim() ? textSearchFilter(text) : null
	if (!filter) return {data: {channels: [], count: 0}, error: null}
	const {data, error, count} = await supabase
		.from('channels_with_tracks')
		.select('*', {count: 'exact'})
		.or(filter)
		.order('updated_at', {ascending: false})
		.order('id')
		.range(offset, offset + limit - 1)
	if (error) return {data: null, error}
	return {data: {channels: /** @type {Channel[]} */ (data ?? []), count: count ?? 0}, error: null}
}
