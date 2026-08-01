import type { FieldPath, FieldValues, UseFormReturn } from 'react-hook-form'
import type { z } from 'zod'

/**
 * A function that applies server errors to a form based on the `zod` error messages.
 */
export function applyServerErrors<
	TFieldValues extends FieldValues = FieldValues,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TContext = any,
	TTransformedValues = TFieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(form: UseFormReturn<TFieldValues, TContext, TTransformedValues>, error: z.core.$ZodIssue[] | string, fallback: string) {
	if (!Array.isArray(error)) {
		form.setError('root', { type: 'manual', message: error || fallback })
		return
	}
	for (const issue of error) {
		const path = issue.path[0]
		if (typeof path === 'string') {
			form.setError(path as TName, { type: issue.code, message: issue.message })
		}
	}
}
