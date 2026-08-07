'use client'

import type { LucideIcon } from 'lucide-react'
import type { FC } from 'react'

import { Grid2x2Icon, ListIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { ButtonGroup } from '@atoms/button-group'
import { Icon } from '@atoms/icon'
import { Toggle } from '@atoms/toggle'
import { ToggleGroup, ToggleGroupItem } from '@atoms/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@atoms/tooltip'

export type MonthSelectionView = 'grid' | 'list'

interface ViewToggleProps {
	value: MonthSelectionView
	onChange: (value: MonthSelectionView) => void
}

const VIEW_ICONS: Record<MonthSelectionView, LucideIcon> = {
	grid: Grid2x2Icon,
	list: ListIcon,
}

export const ViewToggle: FC<ViewToggleProps> = ({ value, onChange }) => {
	const t = useTranslations('monthly-budget-page.view')
	const views: Array<MonthSelectionView> = ['grid', 'list']

	return (
		<ToggleGroup type='single' variant='outline' value={value} onValueChange={(next) => next && onChange(next as MonthSelectionView)}>
			<ButtonGroup>
				{views.map((view) => {
					const label = t(view)

					return (
						<Tooltip key={view}>
							<TooltipTrigger asChild>
								<ToggleGroupItem asChild value={view} aria-label={label}>
									<Toggle value={view}>
										<Icon IconComponent={VIEW_ICONS[view]} size='sm' />
										<span className='sm:hidden'>{label}</span>
									</Toggle>
								</ToggleGroupItem>
							</TooltipTrigger>
							<TooltipContent side='bottom' className='hidden sm:block'>
								{label}
							</TooltipContent>
						</Tooltip>
					)
				})}
			</ButtonGroup>
		</ToggleGroup>
	)
}
