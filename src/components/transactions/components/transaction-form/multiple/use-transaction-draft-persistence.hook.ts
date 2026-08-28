'use client'

import type { CreateTransactionsBatchInput } from '@lib/schemas/transaction/create-transactions-batch'
import type { UseFormReturn } from 'react-hook-form'

import { useEffect, useRef, useState } from 'react'

import { useDebounceCallback, useIsClient, useLocalStorage } from 'usehooks-ts'

import { makeEmptyDraftRow } from './transaction-draft.utils'

export type AutosaveStatus = 'idle' | 'saving' | 'saved'

type DraftRow = CreateTransactionsBatchInput['rows'][number]

const AUTOSAVE_DEBOUNCE_MS = 400
const AUTOSAVE_MIN_VISIBLE_MS = 500

const draftStorageKey = (monthlyBudgetId: string) => `transactions-draft:${monthlyBudgetId}`

/** Revives the `Date`/`recurrenceRule.endDate` fields a JSON round-trip through localStorage turns into plain strings. */
const reviveDraftRow = (row: DraftRow): DraftRow => ({
	...row,
	date: row.date ? new Date(row.date) : row.date,
	recurrenceRule: row.recurrenceRule
		? { ...row.recurrenceRule, endDate: row.recurrenceRule.endDate ? new Date(row.recurrenceRule.endDate) : undefined }
		: row.recurrenceRule,
})

interface UseTransactionDraftPersistenceParams {
	monthlyBudgetId: string
	form: UseFormReturn<CreateTransactionsBatchInput>
	defaultDate: Date
	/** While `false`, no writes to localStorage happen at all — flipping it back on immediately syncs the current values once, then autosave resumes as normal. */
	autosaveEnabled: boolean
}

interface UseTransactionDraftPersistenceResult {
	autosaveStatus: AutosaveStatus
	clearDraft: () => void
}

/**
 * Autosaves Draft mode's rows to `localStorage` (debounced, on every form change) so a refresh/close
 * doesn't lose in-progress work, and seeds the form from whatever was previously stored on mount.
 */
export const useTransactionDraftPersistence = ({
	monthlyBudgetId,
	form,
	defaultDate,
	autosaveEnabled,
}: UseTransactionDraftPersistenceParams): UseTransactionDraftPersistenceResult => {
	const isClient = useIsClient()
	const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>('idle')
	const hydrated = useRef(false)
	const fadeTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)

	const [storedRows, setStoredRows, removeStoredRows] = useLocalStorage<Array<DraftRow>>(draftStorageKey(monthlyBudgetId), [], {
		initializeWithValue: false,
		deserializer: (value) => (JSON.parse(value) as Array<DraftRow>).map(reviveDraftRow),
	})

	// Synchronizing with an external system (localStorage): seed the form once the client value is
	// available. Must happen via `form.reset`, not `defaultValues` — RHF freezes those at first render.
	useEffect(() => {
		if (!isClient || hydrated.current) return
		hydrated.current = true
		form.reset({ rows: storedRows.length > 0 ? storedRows : [makeEmptyDraftRow(defaultDate)] })
	}, [isClient, storedRows, form, defaultDate])

	const persist = useDebounceCallback((rows: Array<DraftRow>) => {
		setStoredRows(rows)
		setAutosaveStatus('saved')
		fadeTimeout.current = setTimeout(() => setAutosaveStatus('idle'), AUTOSAVE_MIN_VISIBLE_MS)
	}, AUTOSAVE_DEBOUNCE_MS)

	useEffect(() => {
		const subscription = form.watch((value) => {
			if (!hydrated.current || !autosaveEnabled) return
			clearTimeout(fadeTimeout.current)
			setAutosaveStatus('saving')
			persist((value.rows ?? []) as Array<DraftRow>)
		})
		return () => subscription.unsubscribe()
	}, [form, persist, autosaveEnabled])

	// Reacting to the toggle itself (not just future form changes), synchronizing with external systems
	// — cancelling an in-flight debounced write and catching localStorage up on re-enable are both
	// imperative calls against a ref/browser API, not React state, so this stays a normal effect.
	useEffect(() => {
		if (!autosaveEnabled) {
			persist.cancel()
			return
		}
		if (hydrated.current) setStoredRows(form.getValues('rows'))
	}, [autosaveEnabled, persist, form, setStoredRows])

	// Resetting the status indicator is a plain internal-state adjustment when a prop changes, which
	// belongs during render, not in an effect — see
	// https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes.
	const [prevAutosaveEnabled, setPrevAutosaveEnabled] = useState(autosaveEnabled)
	if (autosaveEnabled !== prevAutosaveEnabled) {
		setPrevAutosaveEnabled(autosaveEnabled)
		if (!autosaveEnabled) setAutosaveStatus('idle')
	}

	return { autosaveStatus, clearDraft: removeStoredRows }
}
