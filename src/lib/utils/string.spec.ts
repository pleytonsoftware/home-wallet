import { capitalize } from './string'

describe('capitalize', () => {
	it('uppercases the first letter of a lowercase word', () => {
		expect(capitalize('hello')).toBe('Hello')
	})

	it('leaves an already-capitalized word unchanged', () => {
		expect(capitalize('Hello')).toBe('Hello')
	})

	it('only affects the first character of a multi-word string', () => {
		expect(capitalize('hello world')).toBe('Hello world')
	})

	it('returns an empty string unchanged', () => {
		expect(capitalize('')).toBe('')
	})

	it('uppercases a single character', () => {
		expect(capitalize('a')).toBe('A')
	})

	it('leaves non-letter first characters unchanged', () => {
		expect(capitalize('1st place')).toBe('1st place')
	})

	it('does not change the case of remaining characters', () => {
		expect(capitalize('hELLO')).toBe('HELLO')
	})
})
