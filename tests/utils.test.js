import {describe, expect, test} from 'vitest'
import {extractTokens} from '../src/utils.js'

describe('extractTokens', () => {
	test('extracts hashtags from text', () => {
		const result = extractTokens('Check out this #ambient #jazz track')
		expect(result.tags).toEqual(['#ambient', '#jazz'])
		expect(result.mentions).toEqual([])
	})

	test('extracts mentions from text', () => {
		const result = extractTokens('Thanks to @detecteve and @ko002 for sharing')
		expect(result.mentions).toEqual(['detecteve', 'ko002'])
		expect(result.tags).toEqual([])
	})

	test('extracts both hashtags and mentions', () => {
		const result = extractTokens('Check out @detecteve #ambient #jazz')
		expect(result.mentions).toEqual(['detecteve'])
		expect(result.tags).toEqual(['#ambient', '#jazz'])
	})

	test('handles hyphenated tokens', () => {
		const result = extractTokens('#lo-fi @some-channel')
		expect(result.tags).toEqual(['#lo-fi'])
		expect(result.mentions).toEqual(['some-channel'])
	})

	test('lowercases all tokens', () => {
		const result = extractTokens('#AMBIENT @DetecTEVE')
		expect(result.tags).toEqual(['#ambient'])
		expect(result.mentions).toEqual(['detecteve'])
	})

	test('returns empty arrays for empty string', () => {
		const result = extractTokens('')
		expect(result.tags).toEqual([])
		expect(result.mentions).toEqual([])
	})

	test('returns empty arrays for null/undefined', () => {
		const result = extractTokens(null)
		expect(result.tags).toEqual([])
		expect(result.mentions).toEqual([])
	})

	test('ignores tokens that are not separated by whitespace', () => {
		const result = extractTokens('email@example.com file#section')
		expect(result.tags).toEqual([])
		expect(result.mentions).toEqual([])
	})

	test('handles tokens at start and end of string', () => {
		const result = extractTokens('#start middle @end')
		expect(result.tags).toEqual(['#start'])
		expect(result.mentions).toEqual(['end'])
	})
})
