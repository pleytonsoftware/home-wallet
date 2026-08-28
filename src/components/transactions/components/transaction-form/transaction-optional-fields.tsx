import type { CreateTransactionInput } from '@lib/schemas/transaction/create-transaction'
import type { FC } from 'react'

import { useState } from 'react'

import { ChevronsUpDownIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Controller, useFormContext } from 'react-hook-form'

import { Button } from '@atoms/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@atoms/collapsible'
import { Field, FieldError, FieldLabel } from '@atoms/field'
import { Icon } from '@atoms/icon'
import { Switch } from '@atoms/switch'
import { Textarea } from '@atoms/textarea'
import { RECURRENCE_FREQUENCY } from '@lib/constants/recurrence.enum'
import { RecurrencePicker } from '@transactions/components/transaction-form/recurrence-picker'

import { useTransactionFormContainer } from './transaction-form.context'

interface TransactionOptionalFieldsProps {
	defaultOpen: boolean
}

export const TransactionOptionalFields: FC<TransactionOptionalFieldsProps> = ({ defaultOpen }) => {
	const t = useTranslations('transactions-personal-page.form')
	const containerRef = useTransactionFormContainer()
	const { control, watch, setValue, formState } = useFormContext<CreateTransactionInput>()
	const [open, setOpen] = useState(defaultOpen)
	const isRecurring = watch('isRecurring')

	return (
		<Collapsible open={open} onOpenChange={setOpen} className='flex flex-col gap-2'>
			<CollapsibleTrigger asChild>
				<Button type='button' variant='ghost' className='w-full justify-between'>
					{t('more-options')}
					<Icon IconComponent={ChevronsUpDownIcon} size='sm' className='text-muted-foreground' />
				</Button>
			</CollapsibleTrigger>
			<CollapsibleContent animate className='flex flex-col gap-6'>
				<Controller
					name='note'
					control={control}
					render={({ field, fieldState }) => (
						<Field data-invalid={!!fieldState.error}>
							<FieldLabel htmlFor={field.name}>{t('note.label')}</FieldLabel>
							<Textarea {...field} value={field.value ?? ''} disabled={formState.isSubmitting} placeholder={t('note.placeholder')} />
							{fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
						</Field>
					)}
				/>

				<Controller
					name='isRecurring'
					control={control}
					render={({ field }) => (
						<Field orientation='horizontal'>
							<FieldLabel htmlFor={field.name}>{t('recurring.label')}</FieldLabel>
							<Switch
								id={field.name}
								checked={field.value}
								onCheckedChange={(checked) => {
									field.onChange(checked)
									if (checked)
										setValue('recurrenceRule', { frequency: RECURRENCE_FREQUENCY.MONTHLY, interval: 1 }, { shouldValidate: true })
									else setValue('recurrenceRule', undefined, { shouldValidate: true })
								}}
								disabled={formState.isSubmitting}
							/>
						</Field>
					)}
				/>

				{isRecurring && (
					<Controller
						name='recurrenceRule'
						control={control}
						render={({ field }) => (
							<Field data-invalid={!!formState.errors.recurrenceRule}>
								<RecurrencePicker
									value={field.value ?? {}}
									onChange={field.onChange}
									disabled={formState.isSubmitting}
									container={containerRef.current}
								/>
								{formState.errors.recurrenceRule && (
									<FieldError>
										{formState.errors.recurrenceRule.frequency?.message ??
											formState.errors.recurrenceRule.endDate?.message ??
											formState.errors.recurrenceRule.interval?.message ??
											formState.errors.recurrenceRule.occurrences?.message}
									</FieldError>
								)}
							</Field>
						)}
					/>
				)}
			</CollapsibleContent>
		</Collapsible>
	)
}
