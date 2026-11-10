// Tags and mentions, the same rule as parse_tokens() in the radio4000/supabase
// repo, which fills tracks.tags and tracks.mentions. Keep the two in step.
//
// A token is '#' or '@' at the start or after anything that isn't a letter,
// digit, '_' or '&' (as on Twitter), running to the next whitespace or the same
// sign, with trailing punctuation cut, at most 64 characters (as on Bluesky).
// Lowercased, without the sign, deduplicated and sorted.

// Whitespace as Postgres' parse_tokens spells it out, so both stop at the same place.
const WS = '\\s\\u00a0\\u1680\\u2000-\\u200d\\u2028\\u2029\\u202f\\u205f\\u2060\\u3000\\ufeff'
// \w in Postgres' regex is Unicode letters, digits and '_'.
const BEFORE = '(?<![\\p{L}\\p{N}_&])'
const TAG_RE = new RegExp(`${BEFORE}[#＃]([^${WS}#＃]+)`, 'gu')
const MENTION_RE = new RegExp(`${BEFORE}@([^${WS}@]+)`, 'gu')
// Spelled out to match Postgres, where [[:punct:]] depends on the locale.
const TRAILING_PUNCT = /[\]!"#%&'()*,./:;?@[\\_{}¡§«»¿‐-‧、。〈-】！（），．：；？＠［］＿｛｝-]+$/u

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
	/** @type {Token[]} */
	const found = []
	for (const [type, re] of /** @type {const} */ ([
		['tag', TAG_RE],
		['mention', MENTION_RE]
	])) {
		for (const m of text.matchAll(re)) {
			const raw = m[1].replace(TRAILING_PUNCT, '')
			if (!raw || raw.length > 64) continue
			const start = /** @type {number} */ (m.index)
			found.push({type, value: raw.toLowerCase(), start, end: start + 1 + raw.length})
		}
	}
	return found.sort((a, b) => a.start - b.start)
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
