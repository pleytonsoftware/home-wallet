'use client'

import type { FC } from 'react'

import { Grid2x2Icon, ListIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Toggler, type TogglerOption } from '@molecules/toggler'

export type MonthSelectionView = 'grid' | 'list'

interface ViewToggleProps {
	value: MonthSelectionView
	onChange: (value: MonthSelectionView) => void
}

const views: Array<Pick<TogglerOption<MonthSelectionView>, 'value' | 'Icon'>> = [
	{ value: 'grid', Icon: Grid2x2Icon },
	{ value: 'list', Icon: ListIcon },
]

export const ViewToggle: FC<ViewToggleProps> = ({ value, onChange }) => {
	const t = useTranslations('monthly-budget-page.view')

	const options: Array<TogglerOption<MonthSelectionView>> = views.map(({ value: view, Icon }) => {
		const label = t(view)

		return { value: view, label, Icon, ariaLabel: label, tooltip: label }
	})

	return (
		<Toggler
			value={value}
			onChange={onChange}
			options={options}
			labelClassName='sm:hidden'
			tooltipClassName='hidden sm:block'
			tooltipSide='bottom'
		/>
	)
}
