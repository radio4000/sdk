/**
 * Extract tags (#hashtag) and mentions (@channel) from text
 * Useful for parsing channel descriptions, track descriptions, etc.
 * @param {string} str - Text to extract from
 * @returns {{mentions: string[], tags: string[]}}
 * @example
 * extractTokens("Check out @detecteve #ambient #jazz")
 * // => {mentions: ['detecteve'], tags: ['#ambient', '#jazz']}
 */
export function extractTokens(str) {
	// Matches #hashtag or @mention (word boundary to word boundary)
	const ENTITY_REGEX = /(?:^|\s)(#[\w-]+|@[\w-]+)(?=\s|$)/g
	/** @type {string[]} */
	const mentions = []
	/** @type {string[]} */
	const tags = []

	if (!str) return {mentions, tags}

	str.replace(ENTITY_REGEX, (match, entity) => {
		const trimmed = entity.trim()
		if (trimmed.startsWith('#')) {
			tags.push(trimmed.toLowerCase())
		} else if (trimmed.startsWith('@')) {
			mentions.push(trimmed.slice(1).toLowerCase())
		}
		return match
	})

	return {mentions, tags}
}
