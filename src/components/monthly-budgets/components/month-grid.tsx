import type { MonthTile } from '@monthly-budgets/types'
import type { FC } from 'react'

import { MonthCard } from '@monthly-budgets/components/month-card'

interface MonthGridProps {
	tiles: Array<MonthTile>
	onOpen: (month: string) => void
	onCreate: (month: string) => void
}

export const MonthGrid: FC<MonthGridProps> = ({ tiles, onOpen, onCreate }) => (
	<div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
		{tiles.map((tile) => (
			<MonthCard key={tile.month} tile={tile} onOpen={onOpen} onCreate={onCreate} />
		))}
	</div>
)
