'use client'

import type { FC } from 'react'

import { ChevronDownIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@atoms/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@atoms/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@atoms/tooltip'
import { SplitStrategy } from '@lib/constants/split-strategy.enum'

const SPLIT_STRATEGIES = Object.values(SplitStrategy)

interface SplitStrategyDropdownProps {
	name: string
	value: SplitStrategy
	onChange: (value: SplitStrategy) => void
	disabled?: boolean
	container?: React.ComponentProps<typeof DropdownMenuContent>['container']
	modal?: React.ComponentProps<typeof DropdownMenu>['modal']
}

export const SplitStrategyDropdown: FC<SplitStrategyDropdownProps> = ({ name, value, onChange, disabled, container, modal }) => {
	const t = useTranslations('common.fields.split-strategy')
	const options = {
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
	}

	return (
		<DropdownMenu modal={modal}>
			<DropdownMenuTrigger asChild>
				<Button id={name} variant='outline' disabled={disabled} className='w-full justify-between font-normal'>
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
