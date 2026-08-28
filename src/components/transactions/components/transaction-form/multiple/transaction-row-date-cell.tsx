'use client'

import type { FC } from 'react'

import { useTranslations } from 'next-intl'
import { Controller, useFormContext } from 'react-hook-form'

import { DatePicker } from '@molecules/date-picker'

interface TransactionRowDateCellProps {
	/** RHF field path for `date` — `'date'` standalone, or `` `rows.${index}.date` `` in a field array. */
	name: string
	disabled?: boolean
	fromDate: Date
	toDate: Date
}

export const TransactionRowDateCell: FC<TransactionRowDateCellProps> = ({ name, disabled, fromDate, toDate }) => {
	const t = useTranslations('transactions-personal-page.form')
	const { control } = useFormContext()

	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => (
				<DatePicker
					id={field.name}
					value={field.value}
					onChange={(date) => date && field.onChange(date)}
					placeholder={t('date.placeholder')}
					disabled={disabled}
					fromDate={fromDate}
					toDate={toDate}
				/>
			)}
		/>
	)
}
