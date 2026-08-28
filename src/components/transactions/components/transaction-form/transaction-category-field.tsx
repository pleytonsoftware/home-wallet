import type { CreateTransactionInput } from '@lib/schemas/transaction/create-transaction'
import type { FC } from 'react'

import { useEffect } from 'react'

import { useTranslations } from 'next-intl'
import { Controller, useFormContext } from 'react-hook-form'

import { Field, FieldLabel } from '@atoms/field'
import { CategoryCombobox } from '@categories/components/category-combobox'
import { getCategoriesOptions } from '@categories/hooks/queries/get-categories-option'
import { useHouseholdContext } from '@households/context/household.context'
import { PAYMENT_TYPE } from '@lib/constants/payment.enum'
import { isIncomeCategory } from '@lib/utils/category.utils'
import { useQuery } from '@tanstack/react-query'

import { useTransactionFormContainer } from './transaction-form.context'

export const TransactionCategoryField: FC = () => {
	const t = useTranslations('transactions-personal-page.form')
	const { household } = useHouseholdContext()
	const containerRef = useTransactionFormContainer()
	const { control, watch, getValues, setValue, formState } = useFormContext<CreateTransactionInput>()

	const { data: categories = [] } = useQuery(getCategoriesOptions(household.id))
	const incomeCategory = categories.find(isIncomeCategory)
	const type = watch('type')

	useEffect(() => {
		if (!incomeCategory) return

		if (type === PAYMENT_TYPE.INCOME) {
			if (getValues('categoryId') !== incomeCategory.id) {
				setValue('categoryId', incomeCategory.id, { shouldValidate: true })
			}
		} else if (getValues('categoryId') === incomeCategory.id) {
			setValue('categoryId', undefined, { shouldValidate: true })
		}
	}, [type, incomeCategory, getValues, setValue])

	if (type === PAYMENT_TYPE.INCOME) return null

	return (
		<Controller
			name='categoryId'
			control={control}
			render={({ field }) => (
				<Field>
					<FieldLabel htmlFor={field.name}>{t('category.label')}</FieldLabel>
					<CategoryCombobox
						id={field.name}
						name={field.name}
						householdId={household.id}
						value={field.value ?? null}
						onChange={(categoryId) => field.onChange(categoryId ?? undefined)}
						disabled={formState.isSubmitting}
						container={containerRef.current}
						excludeIncomeCategory
					/>
				</Field>
			)}
		/>
	)
}
