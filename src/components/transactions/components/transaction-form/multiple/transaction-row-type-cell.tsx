'use client'

import type { FC } from 'react'

import { useTranslations } from 'next-intl'
import { Controller, useFormContext } from 'react-hook-form'

import { Button } from '@atoms/button'
import { Icon } from '@atoms/icon'
import { Tooltip, TooltipContent, TooltipTrigger } from '@atoms/tooltip'
import { PAYMENT_TYPE } from '@lib/constants/payment.enum'
import { TransactionTypeIcon } from '@transactions/constants/transaction-type-icon'

interface TransactionRowTypeCellProps {
	/** RHF field path — `'type'` for a standalone row form, or `` `rows.${index}.type` `` inside a field array. */
	name: string
	disabled?: boolean
}

/** Compact icon-only Expense/Income toggle for a table row — same colors/icons as `TransactionTypeField`, sized for a cell. */
export const TransactionRowTypeCell: FC<TransactionRowTypeCellProps> = ({ name, disabled }) => {
	const { control } = useFormContext()
	const tPaymentType = useTranslations('common.fields.payment-type')

	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => (
				<div className='flex gap-1'>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								type='button'
								variant={field.value === PAYMENT_TYPE.EXPENSE ? 'destructive' : 'outline'}
								size='icon-sm'
								aria-label={tPaymentType('expense')}
								onClick={() => field.onChange(PAYMENT_TYPE.EXPENSE)}
								disabled={disabled}
							>
								<Icon IconComponent={TransactionTypeIcon[PAYMENT_TYPE.EXPENSE]} size='sm' className='stroke-destructive' />
							</Button>
						</TooltipTrigger>
						<TooltipContent>{tPaymentType('expense')}</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								type='button'
								variant={field.value === PAYMENT_TYPE.INCOME ? 'success' : 'outline'}
								size='icon-sm'
								aria-label={tPaymentType('income')}
								onClick={() => field.onChange(PAYMENT_TYPE.INCOME)}
								disabled={disabled}
							>
								<Icon IconComponent={TransactionTypeIcon[PAYMENT_TYPE.INCOME]} size='sm' className='stroke-success' />
							</Button>
						</TooltipTrigger>
						<TooltipContent>{tPaymentType('income')}</TooltipContent>
					</Tooltip>
				</div>
			)}
		/>
	)
}
