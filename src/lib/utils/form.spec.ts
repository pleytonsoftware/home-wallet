import type { UseFormReturn } from 'react-hook-form'
import type { z } from 'zod'

import { applyServerErrors } from './form'

type Values = { name: string; email: string }

function createForm() {
	const setError = vi.fn()
	const form = { setError } as unknown as UseFormReturn<Values>
	return { form, setError }
}

const issue = (overrides: Partial<z.core.$ZodIssue>): z.core.$ZodIssue =>
	({ code: 'custom', path: ['name'], message: 'Invalid', ...overrides }) as z.core.$ZodIssue

describe('applyServerErrors', () => {
	describe('string error', () => {
		it('sets the message on the root field', () => {
			const { form, setError } = createForm()

			applyServerErrors(form, 'Something went wrong', 'fallback')

			expect(setError).toHaveBeenCalledTimes(1)
			expect(setError).toHaveBeenCalledWith('root', { type: 'manual', message: 'Something went wrong' })
		})

		it('uses the fallback when the error string is empty', () => {
			const { form, setError } = createForm()

			applyServerErrors(form, '', 'fallback message')

			expect(setError).toHaveBeenCalledWith('root', { type: 'manual', message: 'fallback message' })
		})
	})

	describe('issue array', () => {
		it('maps each issue to its field path with code and message', () => {
			const { form, setError } = createForm()

			applyServerErrors(
				form,
				[
					issue({ code: 'too_small', path: ['name'], message: 'Name too short' }),
					issue({ code: 'invalid_format', path: ['email'], message: 'Bad email' }),
				],
				'fallback',
			)

			expect(setError).toHaveBeenCalledTimes(2)
			expect(setError).toHaveBeenCalledWith('name', { type: 'too_small', message: 'Name too short' })
			expect(setError).toHaveBeenCalledWith('email', { type: 'invalid_format', message: 'Bad email' })
		})

		it('skips issues whose first path segment is not a string', () => {
			const { form, setError } = createForm()

			applyServerErrors(
				form,
				[
					issue({ path: [0], message: 'Indexed' }),
					issue({ path: [], message: 'Empty path' }),
					issue({ path: ['name'], code: 'custom', message: 'Kept' }),
				],
				'fallback',
			)

			expect(setError).toHaveBeenCalledTimes(1)
			expect(setError).toHaveBeenCalledWith('name', { type: 'custom', message: 'Kept' })
		})

		it('does nothing for an empty issue array', () => {
			const { form, setError } = createForm()

			applyServerErrors(form, [], 'fallback')

			expect(setError).not.toHaveBeenCalled()
		})

		it('uses the first path segment when the path is nested', () => {
			const { form, setError } = createForm()

			applyServerErrors(form, [issue({ path: ['name', 'first'], code: 'custom', message: 'Nested' })], 'fallback')

			expect(setError).toHaveBeenCalledWith('name', { type: 'custom', message: 'Nested' })
		})
	})
})
