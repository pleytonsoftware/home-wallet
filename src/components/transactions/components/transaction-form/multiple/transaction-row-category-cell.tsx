'use client'

import type { FC, RefObject } from 'react'

import { useEffect, useRef } from 'react'

import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { CategoryCombobox } from '@categories/components/category-combobox'
import { getCategoriesOptions } from '@categories/hooks/queries/get-categories-option'
import { PAYMENT_TYPE } from '@lib/constants/payment.enum'
import { isIncomeCategory } from '@lib/utils/category.utils'
import { focusNext } from '@lib/utils/dom-focus.utils'
import { useQuery } from '@tanstack/react-query'
import { useTransactionFormContainer } from '@transactions/components/transaction-form/transaction-form.context'

interface TransactionRowCategoryCellProps {
	/** RHF field path for `categoryId` — `'categoryId'` standalone, or `` `rows.${index}.categoryId` `` in a field array. */
	name: string
	/** RHF field path for the row's sibling `type` field. */
	typeName: string
	householdId: string
	disabled?: boolean
	/** The row's own wrapper — when given, selecting a category (not clearing it) advances focus to the next field in the row. */
	rowRef?: RefObject<HTMLElement | null>
}

/**
 * Unlike Single mode (which hides the category field entirely for Income), the row stays visible
 * here but locks to the household's base Income category and disables editing — the server
 * re-validates this rule independently, this is a UX affordance only.
 */
export const TransactionRowCategoryCell: FC<TransactionRowCategoryCellProps> = ({ name, typeName, householdId, disabled, rowRef }) => {
	const { control, setValue, getValues } = useFormContext()
	const containerRef = useTransactionFormContainer()
	const { data: categories = [] } = useQuery(getCategoriesOptions(householdId))
	const incomeCategory = categories.find(isIncomeCategory)
	const type = useWatch({ control, name: typeName })
	/** The categoryId selected right before switching to Income, restored when switching back. */
	const previousCategoryId = useRef<string | undefined>(undefined)

	useEffect(() => {
		if (!incomeCategory) return

		if (type === PAYMENT_TYPE.INCOME) {
			const current = getValues(name)
			if (current !== incomeCategory.id) {
				previousCategoryId.current = current
				setValue(name, incomeCategory.id, { shouldValidate: true })
			}
		} else if (getValues(name) === incomeCategory.id) {
			setValue(name, previousCategoryId.current, { shouldValidate: true })
		}
	}, [type, incomeCategory, name, getValues, setValue])

	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => (
				<CategoryCombobox
					id={field.name}
					name={field.name}
					householdId={householdId}
					value={field.value ?? null}
					onChange={(categoryId) => {
						field.onChange(categoryId ?? undefined)
						if (categoryId && rowRef?.current) {
							const row = rowRef.current
							// Locate this trigger by its own id rather than trusting `document.activeElement` —
							// focus may not have reliably returned to it yet at this point (transient
							// close/unmount timing in the combobox), which was landing on the row's first
							// field instead of the one after Category.
							requestAnimationFrame(() => {
								const trigger = row.querySelector<HTMLElement>(`[id="${field.name}"]`)
								focusNext(row, trigger)
							})
						}
					}}
					disabled={disabled || type === PAYMENT_TYPE.INCOME}
					container={containerRef.current}
					triggerClassName='h-9 px-2 py-1 border-0 shadow-none bg-muted/40'
					excludeIncomeCategory
				/>
			)}
		/>
	)
}
