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

/**
 * Like `applyServerErrors`, but for a `{ rows: T[] }` batch form — maps a `['rows', index, field]`
 * issue path to the `rows.${index}.${field}` field (e.g. Draft mode's "Save all"). Issues whose
 * path doesn't start with `['rows', <number>, <string>]` are ignored.
 */
export function applyServerRowErrors<
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
		const [root, rowIndex, field] = issue.path
		if (root !== 'rows' || typeof rowIndex !== 'number' || typeof field !== 'string') continue
		form.setError(`rows.${rowIndex}.${field}` as TName, { type: issue.code, message: issue.message })
	}
}
