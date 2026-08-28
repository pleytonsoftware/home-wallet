'use client'

import type { CreateTransactionInput } from '@lib/schemas/transaction/create-transaction'
import type { FC } from 'react'

import { useTranslations } from 'next-intl'

import { Field, FieldLabel } from '@atoms/field'
import { Input } from '@atoms/input'
import { ToggleGroup, ToggleGroupItem } from '@atoms/toggle-group'
import { RECURRENCE_FREQUENCY } from '@lib/constants/recurrence.enum'
import { DatePicker } from '@molecules/date-picker'
import { EnumDropdown } from '@molecules/enum-dropdown'

type RecurrenceFormValue = NonNullable<CreateTransactionInput['recurrenceRule']>
type EndMode = 'never' | 'on-date' | 'after-occurrences'

interface RecurrencePickerProps {
	value: Partial<RecurrenceFormValue>
	onChange: (value: Partial<RecurrenceFormValue>) => void
	disabled?: boolean
	container?: HTMLDivElement | null
}

const RECURRENCE_FREQUENCIES = Object.values(RECURRENCE_FREQUENCY)

const getEndMode = (value: Partial<RecurrenceFormValue>): EndMode => {
	if (value.endDate) return 'on-date'
	if (value.occurrences) return 'after-occurrences'
	return 'never'
}

export const RecurrencePicker: FC<RecurrencePickerProps> = ({ value, onChange, disabled, container }) => {
	const t = useTranslations('transactions-personal-page.form.recurrence')
	const tFrequency = useTranslations('common.fields.recurrence-frequency')
	const endMode = getEndMode(value)

	const handleEndModeChange = (mode: EndMode) => {
		if (mode === 'never') onChange({ ...value, endDate: undefined, occurrences: undefined })
		if (mode === 'on-date') onChange({ ...value, endDate: value.endDate ?? new Date(), occurrences: undefined })
		if (mode === 'after-occurrences') onChange({ ...value, occurrences: value.occurrences ?? 2, endDate: undefined })
	}

	return (
		<div className='flex flex-col gap-4 rounded-lg border bg-muted/30 p-3'>
			<div className='grid grid-cols-2 gap-3'>
				<Field>
					<FieldLabel>{t('frequency.label')}</FieldLabel>
					<EnumDropdown<RECURRENCE_FREQUENCY>
						name='recurrenceRule.frequency'
						value={value.frequency ?? RECURRENCE_FREQUENCY.MONTHLY}
						onChange={(frequency) => onChange({ ...value, frequency })}
						values={RECURRENCE_FREQUENCIES}
						getLabel={(frequency) => tFrequency(frequency)}
						disabled={disabled}
						container={container}
						modal={!!container}
					/>
				</Field>
				<Field>
					<FieldLabel>{t('interval.label')}</FieldLabel>
					<Input
						type='number'
						inputMode='numeric'
						min={1}
						value={value.interval ?? 1}
						onChange={(e) => onChange({ ...value, interval: Number(e.target.value) || 1 })}
						disabled={disabled}
					/>
				</Field>
			</div>

			<Field>
				<FieldLabel>{t('ends.label')}</FieldLabel>
				<ToggleGroup type='single' variant='outline' value={endMode} onValueChange={(next) => next && handleEndModeChange(next as EndMode)}>
					<ToggleGroupItem value='never' disabled={disabled}>
						{t('ends.never')}
					</ToggleGroupItem>
					<ToggleGroupItem value='on-date' disabled={disabled}>
						{t('ends.on-date')}
					</ToggleGroupItem>
					<ToggleGroupItem value='after-occurrences' disabled={disabled}>
						{t('ends.after-occurrences')}
					</ToggleGroupItem>
				</ToggleGroup>
			</Field>

			{endMode === 'on-date' && (
				<Field>
					<FieldLabel>{t('end-date.label')}</FieldLabel>
					<DatePicker value={value.endDate} onChange={(date) => onChange({ ...value, endDate: date })} disabled={disabled} />
				</Field>
			)}

			{endMode === 'after-occurrences' && (
				<Field>
					<FieldLabel>{t('occurrences.label')}</FieldLabel>
					<Input
						type='number'
						inputMode='numeric'
						min={2}
						value={value.occurrences ?? 2}
						onChange={(e) => onChange({ ...value, occurrences: Number(e.target.value) || 2 })}
						disabled={disabled}
					/>
				</Field>
			)}
		</div>
	)
}
