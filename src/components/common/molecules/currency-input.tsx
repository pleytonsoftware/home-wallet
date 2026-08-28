'use client'

import type { ComponentProps, FC } from 'react'

import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@atoms/input-group'
import { cn } from '@cn'
import { getCurrencySymbol } from '@households/utils'
import { PAYMENT_TYPE } from '@lib/constants/payment.enum'

interface CurrencyInputProps extends Omit<ComponentProps<typeof InputGroupInput>, 'type'> {
	currency: string
	/** Colors the entered amount — red for Expense, green for Income. Omit for a neutral/untyped amount (e.g. a budget target). */
	transactionType?: PAYMENT_TYPE
	locale?: string
}

export const CurrencyInput: FC<CurrencyInputProps> = ({ currency, transactionType, className, locale, ...props }) => (
	<InputGroup className={className}>
		<InputGroupAddon align='inline-start'>
			<InputGroupText>{getCurrencySymbol(currency, locale)}</InputGroupText>
		</InputGroupAddon>
		<span
			className={cn(
				'pl-2',
				transactionType === PAYMENT_TYPE.INCOME && 'text-success',
				transactionType === PAYMENT_TYPE.EXPENSE && 'text-destructive',
			)}
		>
			{transactionType === PAYMENT_TYPE.INCOME ? '+' : '-'}
		</span>
		<InputGroupInput
			type='number'
			inputMode='decimal'
			step='0.01'
			min={0}
			className={cn(transactionType === PAYMENT_TYPE.INCOME && 'text-success', transactionType === PAYMENT_TYPE.EXPENSE && 'text-destructive')}
			{...props}
		/>
		<InputGroupAddon align='inline-end'>
			<InputGroupText>{currency}</InputGroupText>
		</InputGroupAddon>
	</InputGroup>
)
