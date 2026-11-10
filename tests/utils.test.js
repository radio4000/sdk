import {describe, expect, test} from 'vitest'
import {extractTokens, findTokens} from '../src/utils.js'

// Same cases as parse_tokens() in radio4000/supabase; the two must agree.
const tags = (s) => extractTokens(s).tags
const mentions = (s) => extractTokens(s).mentions

describe('extractTokens', () => {
	test('tags and mentions, lowercased, without the sign, sorted', () => {
		expect(extractTokens('Check out @Detecteve #Jazz #ambient')).toEqual({
			tags: ['ambient', 'jazz'],
			mentions: ['detecteve']
		})
	})

	test('a description may start with a tag', () => {
		expect(tags('#island #1983 #japan')).toEqual(['1983', 'island', 'japan'])
	})

	test('trailing punctuation is cut', () => {
		expect(tags('#Techno, #house; #wow!? #ok. #bíblia!')).toEqual([
			'bíblia',
			'house',
			'ok',
			'techno',
			'wow'
		])
		expect(mentions('thx @ko002! and @sugar-hiccup;')).toEqual(['ko002', 'sugar-hiccup'])
	})

	test('punctuation inside a tag stays, and so do + and =', () => {
		expect(tags('#funk-/-soul #r&b #c++ #lo-fi #80s')).toEqual([
			'80s',
			'c++',
			'funk-/-soul',
			'lo-fi',
			'r&b'
		])
	})

	test('a tag may follow punctuation, but not a letter, digit, _, & or /', () => {
		expect(tags('(#uk) "#balearic bliss" nice...#chill')).toEqual(['balearic', 'chill', 'uk'])
		expect(tags('https://x.com/page#top a_#b &#39; site.com/#about app.com/#/route')).toEqual([])
		expect(mentions('mail info@shop.com or (@alice)')).toEqual(['alice'])
		expect(mentions('youtube.com/@ko002/videos medium.com/@alice/post-1')).toEqual([])
	})

	test('a mention is a slug: letters, digits, _ and -', () => {
		expect(mentions("@alice's mix by @rádio-latina and @under_score_")).toEqual([
			'alice',
			'rádio-latina',
			'under_score_'
		])
	})

	test('underscores stay at the end of a tag', () => {
		expect(tags('#_under_ #a_')).toEqual(['_under_', 'a_'])
	})

	test('a tag stops at the next # and a mention at the next @', () => {
		expect(tags('#weird#minimal #a,#b')).toEqual(['a', 'b', 'weird'])
		expect(mentions('@a,@b @c@d')).toEqual(['a', 'b', 'c'])
	})

	test('stops at unusual whitespace too', () => {
		expect(tags('LP3\u00a0#electro\u200b#x #rock\u3000#pop')).toEqual([
			'electro',
			'pop',
			'rock',
			'x'
		])
	})

	test('emoji and astral characters keep positions right', () => {
		const text = '🔥 #emoji🔥 @ko002'
		expect(findTokens(text).map((t) => text.slice(t.start, t.end))).toEqual(['#emoji🔥', '@ko002'])
	})

	test('drops empty and over-long tokens, and duplicates', () => {
		expect(tags('# ## #!!! #jazz #JAZZ')).toEqual(['jazz'])
		expect(tags(`#${'a'.repeat(65)} #${'b'.repeat(64)}`)).toEqual(['b'.repeat(64)])
	})

	test('handles empty input', () => {
		expect(extractTokens('')).toEqual({tags: [], mentions: []})
		expect(extractTokens(null)).toEqual({tags: [], mentions: []})
		expect(extractTokens(undefined)).toEqual({tags: [], mentions: []})
	})
})

describe('findTokens', () => {
	test('values with their place in the text, in order', () => {
		const text = 'Thx @KO002! #Techno, (#uk)'
		const found = findTokens(text)
		expect(found).toEqual([
			{type: 'mention', value: 'ko002', start: 4, end: 10},
			{type: 'tag', value: 'techno', start: 12, end: 19},
			{type: 'tag', value: 'uk', start: 22, end: 25}
		])
		expect(found.map((t) => text.slice(t.start, t.end))).toEqual(['@KO002', '#Techno', '#uk'])
	})

	test('empty input', () => {
		expect(findTokens('')).toEqual([])
		expect(findTokens(null)).toEqual([])
	})
})
