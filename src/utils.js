// Tags and mentions, the same rule as parse_tokens() in the radio4000/supabase
// repo, which fills tracks.tags and tracks.mentions. Keep the two in step;
// both are plain string steps so they read the same.
//
// A '#' or '@' starts a token at the start of the text or after whitespace or
// punctuation, but not after a letter, digit, '_', '&' or '/', so "page#top",
// "info@shop.com", "&#39;" and "youtube.com/@ko002" don't count.
//   tag:     up to the next whitespace or '#', trailing punctuation cut. "#techno," is "techno".
//   mention: a channel slug, so letters, digits, '_' and '-'. "@alice's" is "alice".
// Lowercased, without the sign, at most 64 characters.

/** Whitespace, including no-break and zero-width spaces and line separators. */
const SPACES = new Set(
	' \t\n\v\f\r\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u200c\u200d\u2028\u2029\u202f\u205f\u2060\u3000\ufeff'
)

/** Cut from the end of a tag. */
const CUT = new Set(
	'!"#%&\'()*,./:;?@[\\]{}¡§«»¿‐‑‒–—―‖‗‘’‚‛“”„‟†‡•‣․‥…‧、。〈〉《》「」『』【】！（），．：；？＠［］｛｝-'
)

/** A letter or decimal digit in any script, as Postgres' [[:alnum:]] sees it. */
const ALNUM = /^[\p{L}\p{Nd}]$/u
const isAlnum = (/** @type {string} */ c) => ALNUM.test(c)

/** Whether a sign right after `c` starts a token. `undefined` is the start of the text. */
const startsAfter = (/** @type {string | undefined} */ c) =>
	c === undefined || SPACES.has(c) || !(isAlnum(c) || c === '_' || c === '&' || c === '/')

/**
 * @typedef {Object} Token
 * @property {'tag' | 'mention'} type
 * @property {string} value - Lowercased, without the sign
 * @property {number} start - Index of the sign in the text
 * @property {number} end - Index after the token, so text.slice(start, end) is "#Techno"
 */

/**
 * Every tag and mention in the text, in order, with where it sits. For
 * rendering links; use extractTokens() when you only need the values.
 * @param {string | null | undefined} text
 * @returns {Token[]}
 */
export function findTokens(text) {
	if (!text) return []
	const chars = [...text]
	// Where each character starts in `text`, so start/end slice the original string.
	const offsets = [0]
	for (const c of chars) offsets.push(offsets[offsets.length - 1] + c.length)

	/** @type {Token[]} */
	const found = []
	for (let i = 0; i < chars.length; i++) {
		const sign = chars[i]
		if ((sign !== '#' && sign !== '@') || !startsAfter(chars[i - 1])) continue
		let end = i + 1
		if (sign === '#') {
			while (end < chars.length && chars[end] !== '#' && !SPACES.has(chars[end])) end++
			while (end > i + 1 && CUT.has(chars[end - 1])) end--
		} else {
			while (
				end < chars.length &&
				(isAlnum(chars[end]) || chars[end] === '_' || chars[end] === '-')
			)
				end++
		}
		const length = end - i - 1
		if (length === 0 || length > 64) continue
		found.push({
			type: sign === '#' ? 'tag' : 'mention',
			value: chars
				.slice(i + 1, end)
				.join('')
				.toLowerCase(),
			start: offsets[i],
			end: offsets[end]
		})
	}
	return found
}

/**
 * Extract tags (#hashtag) and mentions (@channel) from text, the way the database does.
 * @param {string | null | undefined} str - Text to extract from
 * @returns {{mentions: string[], tags: string[]}}
 * @example
 * extractTokens("Check out @detecteve #Ambient #jazz,")
 * // => {mentions: ['detecteve'], tags: ['ambient', 'jazz']}
 */
export function extractTokens(str) {
	const tags = new Set()
	const mentions = new Set()
	for (const t of findTokens(str)) (t.type === 'tag' ? tags : mentions).add(t.value)
	return {tags: [...tags].sort(), mentions: [...mentions].sort()}
}
