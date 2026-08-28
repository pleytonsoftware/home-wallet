'use client'

import type { FC } from 'react'
import type { Matcher } from 'react-day-picker'

import { CalendarIcon } from 'lucide-react'
import { useFormatter } from 'next-intl'

import { Button } from '@atoms/button'
import { Calendar } from '@atoms/calendar'
import { Icon } from '@atoms/icon'
import { Popover, PopoverContent, PopoverTrigger } from '@atoms/popover'
import { cn } from '@cn'

interface DatePickerProps {
	id?: string
	value?: Date | null
	onChange: (date: Date | undefined) => void
	placeholder?: string
	disabled?: boolean
	/** Restricts selectable/navigable dates to this range — e.g. the bounds of the month a transaction belongs to. */
	fromDate?: Date
	toDate?: Date
}

export const DatePicker: FC<DatePickerProps> = ({ id, value, onChange, placeholder, disabled, fromDate, toDate }) => {
	const format = useFormatter()

	const matchers: Array<Matcher> = []
	if (fromDate) matchers.push({ before: fromDate })
	if (toDate) matchers.push({ after: toDate })

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					id={id}
					type='button'
					variant='outline'
					disabled={disabled}
					className={cn('w-full justify-start gap-2 font-normal', !value && 'text-muted-foreground')}
				>
					<Icon IconComponent={CalendarIcon} size='sm' />
					{value ? format.dateTime(value, { dateStyle: 'medium' }) : placeholder}
				</Button>
			</PopoverTrigger>
			<PopoverContent className='w-auto p-0'>
				<Calendar
					mode='single'
					selected={value ?? undefined}
					onSelect={onChange}
					defaultMonth={value ?? fromDate}
					startMonth={fromDate}
					endMonth={toDate}
					disabled={matchers.length > 0 ? matchers : undefined}
					autoFocus
				/>
			</PopoverContent>
		</Popover>
	)
}
