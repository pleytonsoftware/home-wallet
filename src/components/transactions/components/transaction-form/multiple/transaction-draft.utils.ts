import type { CreateTransactionInput } from '@lib/schemas/transaction/create-transaction'

import { PAYMENT_TYPE } from '@lib/constants/payment.enum'

/**
 * Shared grid-template so the Draft grid's header row and every data row line up exactly. Every
 * non-flexible column uses a **fixed** length rather than `auto` — the header and each row are
 * separate grid containers, so an `auto` column sizes to *that instance's own* content (e.g. the
 * header's plain text vs. a row's icon buttons, or a row with the trailing trash button vs. the
 * last row without one), drifting out of alignment. Fixed lengths remove that dependency entirely.
 */
export const DRAFT_ROW_GRID_CLASS = 'grid grid-cols-[4.5rem_1fr_8rem_1fr_1fr_9rem_2.5rem_2.5rem] items-center gap-2'

export const makeEmptyDraftRow = (defaultDate: Date): CreateTransactionInput => ({
	name: '',
	amount: '' as unknown as number,
	type: PAYMENT_TYPE.EXPENSE,
	categoryId: undefined,
	sourceAccountId: undefined,
	note: '',
	date: defaultDate,
	isRecurring: false,
	recurrenceRule: undefined,
})

/** A row counts toward the total/row-count once it has any real data — an untouched empty row doesn't. */
export const hasRowData = (row: CreateTransactionInput): boolean =>
	row.name.trim().length > 0 || !!row.amount || !!row.categoryId || !!row.sourceAccountId

export const computeDraftTotals = (rows: Array<CreateTransactionInput>) => {
	const nonEmptyRows = rows.filter(hasRowData)
	const total = nonEmptyRows.reduce((sum, row) => sum + (row.amount || 0) * (row.type === PAYMENT_TYPE.INCOME ? 1 : -1), 0)
	return { count: nonEmptyRows.length, total }
}
