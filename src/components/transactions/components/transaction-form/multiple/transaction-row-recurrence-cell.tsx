'use client'

import type { FC } from 'react'
import type { FieldErrors } from 'react-hook-form'

import { RepeatIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Controller, useFormContext, useWatch } from 'react-hook-form'

import { Button } from '@atoms/button'
import { Field, FieldError, FieldLabel } from '@atoms/field'
import { Icon } from '@atoms/icon'
import { Popover, PopoverContent, PopoverTrigger } from '@atoms/popover'
import { Switch } from '@atoms/switch'
import { RECURRENCE_FREQUENCY } from '@lib/constants/recurrence.enum'
import { RecurrencePicker } from '@transactions/components/transaction-form/recurrence-picker'

interface TransactionRowRecurrenceCellProps {
	/** RHF field path for `isRecurring`. */
	isRecurringName: string
	/** RHF field path for `recurrenceRule`. */
	recurrenceRuleName: string
	disabled?: boolean
}

const getNestedErrorMessage = (errors: FieldErrors, path: string): string | undefined => {
	const value = path.split('.').reduce<unknown>((acc, key) => (acc as Record<string, unknown> | undefined)?.[key], errors)
	return (value as { message?: string } | undefined)?.message
}

/** Small repeat-icon toggle opening a `Popover` that reuses the existing `RecurrencePicker` unmodified. */
export const TransactionRowRecurrenceCell: FC<TransactionRowRecurrenceCellProps> = ({ isRecurringName, recurrenceRuleName, disabled }) => {
	const t = useTranslations('transactions-personal-page.form')
	const { control, setValue, formState } = useFormContext()
	const isRecurring = useWatch({ control, name: isRecurringName })
	const recurrenceError =
		getNestedErrorMessage(formState.errors, `${recurrenceRuleName}.frequency`) ??
		getNestedErrorMessage(formState.errors, `${recurrenceRuleName}.endDate`) ??
		getNestedErrorMessage(formState.errors, `${recurrenceRuleName}.interval`) ??
		getNestedErrorMessage(formState.errors, `${recurrenceRuleName}.occurrences`)

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					type='button'
					variant={isRecurring ? 'default' : 'outline'}
					size='icon-sm'
					aria-label={t('recurring.label')}
					disabled={disabled}
				>
					<Icon IconComponent={RepeatIcon} size='sm' />
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-80'>
				<div className='flex flex-col gap-4'>
					<Controller
						name={isRecurringName}
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
											setValue(
												recurrenceRuleName,
												{ frequency: RECURRENCE_FREQUENCY.MONTHLY, interval: 1 },
												{ shouldValidate: true },
											)
										else setValue(recurrenceRuleName, undefined, { shouldValidate: true })
									}}
									disabled={disabled}
								/>
							</Field>
						)}
					/>

					{isRecurring && (
						<Controller
							name={recurrenceRuleName}
							control={control}
							render={({ field }) => (
								<Field data-invalid={!!recurrenceError}>
									<RecurrencePicker value={field.value ?? {}} onChange={field.onChange} disabled={disabled} />
									{recurrenceError && <FieldError>{recurrenceError}</FieldError>}
								</Field>
							)}
						/>
					)}
				</div>
			</PopoverContent>
		</Popover>
	)
}
