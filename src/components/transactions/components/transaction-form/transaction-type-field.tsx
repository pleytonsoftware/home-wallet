import type { CreateTransactionInput } from '@lib/schemas/transaction/create-transaction'
import type { FC } from 'react'

import { useTranslations } from 'next-intl'
import { Controller, useFormContext } from 'react-hook-form'

import { Button } from '@atoms/button'
import { Field, FieldLabel } from '@atoms/field'
import { Icon } from '@atoms/icon'
import { PAYMENT_TYPE } from '@lib/constants/payment.enum'
import { TransactionTypeIcon } from '@transactions/constants/transaction-type-icon'

export const TransactionTypeField: FC = () => {
	const t = useTranslations('transactions-personal-page.form')
	const tPaymentType = useTranslations('common.fields.payment-type')
	const { control, formState } = useFormContext<CreateTransactionInput>()

	return (
		<Controller
			name='type'
			control={control}
			render={({ field }) => (
				<Field>
					<FieldLabel>{t('type.label')}</FieldLabel>
					<div className='grid grid-cols-2 gap-2'>
						<Button
							type='button'
							variant={field.value === PAYMENT_TYPE.EXPENSE ? 'destructive' : 'outline'}
							onClick={() => field.onChange(PAYMENT_TYPE.EXPENSE)}
							disabled={formState.isSubmitting}
							className='gap-1.5'
						>
							<Icon IconComponent={TransactionTypeIcon[PAYMENT_TYPE.EXPENSE]} size='sm' className='stroke-destructive' />
							{tPaymentType('expense')}
						</Button>
						<Button
							type='button'
							variant={field.value === PAYMENT_TYPE.INCOME ? 'success' : 'outline'}
							onClick={() => field.onChange(PAYMENT_TYPE.INCOME)}
							disabled={formState.isSubmitting}
							className='gap-1.5'
						>
							<Icon IconComponent={TransactionTypeIcon[PAYMENT_TYPE.INCOME]} size='sm' className='stroke-success' />
							{tPaymentType('income')}
						</Button>
					</div>
				</Field>
			)}
		/>
	)
}
