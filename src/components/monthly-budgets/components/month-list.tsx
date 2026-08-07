import type { MonthTile } from '@monthly-budgets/types'
import type { FC } from 'react'

import { MonthListRow } from '@monthly-budgets/components/month-list-row'

interface MonthListProps {
	tiles: Array<MonthTile>
	onOpen: (month: string) => void
	onCreate: (month: string) => void
}

export const MonthList: FC<MonthListProps> = ({ tiles, onOpen, onCreate }) => (
	<ul className='flex flex-col gap-1.5'>
		{tiles.map((tile) => (
			<MonthListRow key={tile.month} tile={tile} onOpen={onOpen} onCreate={onCreate} />
		))}
	</ul>
)
