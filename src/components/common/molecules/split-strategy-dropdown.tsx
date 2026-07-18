'use client'

import { Fragment, useRef, type FC } from 'react'

import { ChevronDownIcon, CircleQuestionMarkIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useBoolean, useOnClickOutside } from 'usehooks-ts'

import { Button, buttonVariants } from '@atoms/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@atoms/dropdown-menu'
import { FieldLabel } from '@atoms/field'
import { Icon } from '@atoms/icon'
import { Separator } from '@atoms/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@atoms/tooltip'
import { cn } from '@cn'
import { useIsNativeMobile } from '@hooks/use-native-mobile'
import { SplitStrategy } from '@lib/constants/split-strategy.enum'

const SPLIT_STRATEGIES = Object.values(SplitStrategy)

interface SplitStrategyLabelProps {
	name: string
	label: string
}
interface SplitStrategyDropdownProps {
	name: string
	value: SplitStrategy
	onChange: (value: SplitStrategy) => void
	disabled?: boolean
	container?: React.ComponentProps<typeof DropdownMenuContent>['container']
	modal?: React.ComponentProps<typeof DropdownMenu>['modal']
}

export const mapSplitStrategyToTranslations = (t: ReturnType<typeof useTranslations<'common.fields.split-strategy'>>) =>
	({
		[SplitStrategy.EQUAL]: {
			name: t('options.equal.name'),
			description: t('options.equal.description'),
		},
		[SplitStrategy.PROPORTIONAL_TO_INCOME]: {
			name: t('options.proportional_to_income.name'),
			description: t('options.proportional_to_income.description'),
		},
		[SplitStrategy.CUSTOM_PERCENTAGES]: {
			name: t('options.custom_percentages.name'),
			description: t('options.custom_percentages.description'),
		},
		[SplitStrategy.ROUND_ROBIN]: {
			name: t('options.round_robin.name'),
			description: t('options.round_robin.description'),
		},
		[SplitStrategy.CUSTOM_AMOUNTS]: {
			name: t('options.custom_amounts.name'),
			description: t('options.custom_amounts.description'),
		},
	}) as const

export const SplitStrategyLabel: FC<SplitStrategyLabelProps> = ({ name, label }) => {
	const t = useTranslations('common.fields.split-strategy')
	const { value: isOpen, setTrue: openTooltip, setFalse: closeTooltip } = useBoolean(false)
	const isNativeMobile = useIsNativeMobile()
	const tooltipRef = useRef<HTMLDivElement>(undefined!)
	useOnClickOutside(tooltipRef, closeTooltip)

	return (
		<FieldLabel htmlFor={name}>
			{label}
			{isNativeMobile && (
				<>
					{' '}
					<Tooltip open={isOpen}>
						<TooltipTrigger
							asChild
							onClick={(e) => {
								e.preventDefault()
								openTooltip()
							}}
						>
							<Icon IconComponent={CircleQuestionMarkIcon} size='xs' className='hover:cursor-pointer' />
						</TooltipTrigger>
						<TooltipContent side='bottom' className='flex w-[95vw] mr-2 max-w-lg flex-col gap-2 text-xs py-4 px-3' ref={tooltipRef}>
							{Object.entries(mapSplitStrategyToTranslations(t)).map(([key, value], index, array) => (
								<Fragment key={key}>
									<dl className='flex w-full items-start justify-between gap-4'>
										<dt className='font-bold w-1/3'>{value.name}</dt>
										<Separator className='my-1' orientation='vertical' />
										<dd className='text-muted w-2/3'>{value.description}</dd>
									</dl>
									{index < array.length - 1 && <Separator className='my-1' />}
								</Fragment>
							))}
						</TooltipContent>
					</Tooltip>
				</>
			)}
		</FieldLabel>
	)
}

export const SplitStrategyDropdown: FC<SplitStrategyDropdownProps> = ({ name, value, onChange, disabled, container, modal }) => {
	const t = useTranslations('common.fields.split-strategy')
	const isNativeMobile = useIsNativeMobile()
	const options = mapSplitStrategyToTranslations(t)

	return isNativeMobile ? (
		<NativeSelect name={name} value={value} onChange={onChange} disabled={disabled} options={options} />
	) : (
		<DropdownMenu modal={modal}>
			<DropdownMenuTrigger asChild>
				<Button aria-label={options[value].name} variant='outline' disabled={disabled} className='w-full justify-between font-normal'>
					<span className='truncate'>{options[value].name}</span>
					<ChevronDownIcon className='opacity-50' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='start' className='w-(--radix-dropdown-menu-trigger-width)' container={container}>
				<DropdownMenuRadioGroup value={value} onValueChange={(next) => onChange(next as SplitStrategy)}>
					{SPLIT_STRATEGIES.map((strategy) => (
						<DropdownMenuRadioItem key={strategy} value={strategy}>
							<Tooltip>
								<TooltipTrigger asChild>
									<span className='block w-full truncate'>{options[strategy].name}</span>
								</TooltipTrigger>
								<TooltipContent side='left'>
									<p>{options[strategy].description}</p>
								</TooltipContent>
							</Tooltip>
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

const NativeSelect: FC<
	Pick<SplitStrategyDropdownProps, 'name' | 'value' | 'onChange' | 'disabled'> & { options: Record<SplitStrategy, { name: string }> }
> = ({ name, value, onChange, disabled, options }) => (
	<select
		id={name}
		name={name}
		value={value}
		disabled={disabled}
		onChange={(e) => onChange(e.target.value as SplitStrategy)}
		className={cn(buttonVariants({ variant: 'outline' }), 'w-full appearance-none justify-between pr-8 font-normal')}
	>
		{SPLIT_STRATEGIES.map((strategy) => (
			<option key={strategy} value={strategy}>
				{options[strategy].name}
			</option>
		))}
	</select>
)
