'use client'

import type { ReactNode } from 'react'

import { ChevronDownIcon } from 'lucide-react'

import { Button, buttonVariants } from '@atoms/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@atoms/dropdown-menu'
import { cn } from '@cn'
import { useIsNativeMobile } from '@hooks/use-native-mobile'

export interface EnumDropdownProps<V extends string> {
	name: string
	value: V
	onChange: (value: V) => void
	/** The enum's values, in the order they should be listed. */
	values: ReadonlyArray<V>
	/** Plain-text label for a value — used by the native `<select>` and as the default trigger/option content. */
	getLabel: (value: V) => string
	/** Overrides the trigger button's content for the selected value. Defaults to `getLabel`. */
	renderTrigger?: (value: V) => ReactNode
	/** Overrides a menu item's content. Defaults to `getLabel`. */
	renderOption?: (value: V) => ReactNode
	disabled?: boolean
	container?: React.ComponentProps<typeof DropdownMenuContent>['container']
	modal?: React.ComponentProps<typeof DropdownMenu>['modal']
	triggerClassName?: string
}

/**
 * Generic enum-backed dropdown: a radio-group `DropdownMenu` on desktop, and a native `<select>`
 * on native mobile (where custom popovers fight the OS's own picker UX). Feature dropdowns (e.g.
 * account type, split strategy) build on this for their enum-specific rendering.
 */
export function EnumDropdown<V extends string>({
	name,
	value,
	onChange,
	values,
	getLabel,
	renderTrigger,
	renderOption,
	disabled,
	container,
	modal,
	triggerClassName,
}: EnumDropdownProps<V>) {
	const isNativeMobile = useIsNativeMobile()

	return isNativeMobile ? (
		<select
			id={name}
			name={name}
			value={value}
			disabled={disabled}
			onChange={(e) => onChange(e.target.value as V)}
			className={cn(buttonVariants({ variant: 'outline' }), 'w-full appearance-none justify-between pr-8 font-normal', triggerClassName)}
		>
			{values.map((option) => (
				<option key={option} value={option}>
					{getLabel(option)}
				</option>
			))}
		</select>
	) : (
		<DropdownMenu modal={modal}>
			<DropdownMenuTrigger asChild>
				<Button
					aria-label={getLabel(value)}
					variant='outline'
					disabled={disabled}
					className={cn('w-full justify-between font-normal', triggerClassName)}
				>
					<span className='flex min-w-0 items-center gap-2 truncate'>{renderTrigger ? renderTrigger(value) : getLabel(value)}</span>
					<ChevronDownIcon className='opacity-50' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='start' className='w-(--radix-dropdown-menu-trigger-width)' container={container}>
				<DropdownMenuRadioGroup value={value} onValueChange={(next) => onChange(next as V)}>
					{values.map((option) => (
						<DropdownMenuRadioItem key={option} value={option}>
							{renderOption ? renderOption(option) : <span className='block w-full truncate'>{getLabel(option)}</span>}
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
