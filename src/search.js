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

/** "ko002," → "ko002": what's left of a word once trailing punctuation is cut. */
const trimSlug = (/** @type {string} */ word) => word.replace(/[^\p{L}\p{N}_-]+$/u, '')

/** "Alice's" → "alice": the leading slug characters, as tracks.mentions stores them. */
const mentionSlug = (/** @type {string} */ word) =>
	(word.match(/^[\p{L}\p{N}_-]+/u)?.[0] ?? '').toLowerCase()

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
		if (/^mention:@/i.test(word)) {
			const slug = mentionSlug(word.slice('mention:@'.length))
			if (slug) mentions.add(slug)
		} else if (word.startsWith('@')) {
			const slug = trimSlug(word.slice(1))
			if (slug) channels.add(slug)
		} else if (word.startsWith('#') || word.startsWith('＃')) {
			for (const t of extractTokens(word).tags) tags.add(t)
		} else {
			words.push(word)
		}
	}
	return {channels: [...channels], tags: [...tags], mentions: [...mentions], text: words.join(' ')}
}

// Full-text search: websearch syntax (`jazz or funk`, `-techno`, `"exact
// phrase"`) plus prefix matching, so `detr` finds `detroit` while typing.

/** `or`, a leading `-` or a quote: websearch syntax, which prefix matching would break. */
const hasWebsearchSyntax = (/** @type {string} */ text) => /\bor\b|^-|\s-|"/i.test(text)

/** Drop characters that break PostgREST's filter syntax. */
const sanitize = (/** @type {string} */ text) =>
	text
		.replace(/[,()&|!*"\\]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()

/** "jazz hou" → "jazz:* & hou:*" */
const toPrefix = (/** @type {string} */ text) =>
	text
		.split(' ')
		.map((w) => w.replace(/[^\p{L}\p{N}]/gu, ''))
		.filter(Boolean)
		.map((w) => `${w}:*`)
		.join(' & ')

/**
 * Filter for PostgREST's `or()` on an `fts` column, or null when nothing is left to search.
 * @param {string | undefined} text
 * @returns {string | null}
 */
function ftsFilter(text) {
	const safe = sanitize(text ?? '')
	if (!safe) return null
	// Check the original text: sanitize strips the quotes of "exact phrase".
	const prefix = hasWebsearchSyntax(text ?? '') ? '' : toPrefix(safe)
	return prefix ? `fts.wfts.${safe},fts.fts.${prefix}` : `fts.wfts.${safe}`
}

/**
 * Filter for PostgREST's `or()`: the slug is any of these, ignoring case, since
 * some slugs have capitals ("baladas-80-1ToO") and people type them lowercase.
 * Each is escaped for LIKE (`%`, `_`) and quoted for the filter (commas, dots).
 * @param {string[]} slugs
 */
function anySlug(slugs) {
	const escapeLike = (/** @type {string} */ s) => s.replace(/[\\%_]/g, '\\$&')
	const quote = (/** @type {string} */ s) => `"${s.replace(/["\\]/g, '\\$&')}"`
	return slugs.map((slug) => `slug.ilike.${quote(escapeLike(slug))}`).join(',')
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
	const filter = ftsFilter(text)
	if (!channels?.length && !tags?.length && !mentions?.length && !filter) {
		return {data: {tracks: [], count: 0}, error: null}
	}
	let request = supabase.from('channel_tracks').select('*', {count: 'exact'})
	if (channels?.length) request = request.or(anySlug(channels))
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
	const filter = ftsFilter(text)
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
