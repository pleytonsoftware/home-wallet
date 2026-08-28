import type { FC } from 'react'

import { Skeleton } from '@atoms/skeleton'

/** One row placeholder — mirrors {@link TransactionRow}'s icon-circle + name/category + amount layout. */
const TransactionRowSkeleton: FC = () => (
	<div className='flex w-full items-center gap-3 rounded-lg px-2 py-2'>
		<Skeleton className='size-9 shrink-0 rounded-full' />
		<div className='flex min-w-0 flex-1 flex-col gap-1.5'>
			<Skeleton className='h-3.5 w-32 max-w-full' />
			<Skeleton className='h-3 w-20 max-w-full' />
		</div>
		<Skeleton className='h-4 w-14 shrink-0' />
	</div>
)

/** Loading placeholder for {@link MonthlySummaryHeader}'s stats card. */
export const MonthlySummaryHeaderSkeleton: FC = () => (
	<div className='flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between'>
		<div className='grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4'>
			{Array.from({ length: 4 }).map((_, index) => (
				<div key={index} className='flex flex-col gap-1.5'>
					<Skeleton className='h-3 w-14' />
					<Skeleton className='h-5 w-20' />
				</div>
			))}
		</div>
		<Skeleton className='size-16 shrink-0 rounded-full' />
	</div>
)

/** Loading placeholder for {@link DailyTimeline} — a couple of day groups, each with a few rows. */
export const DailyTimelineSkeleton: FC = () => (
	<div className='flex flex-col gap-6'>
		{[3, 2].map((rowCount, groupIndex) => (
			<div key={groupIndex} className='flex flex-col gap-1'>
				<div className='flex items-center justify-between px-2'>
					<Skeleton className='h-4 w-16' />
					<Skeleton className='h-3 w-12' />
				</div>
				<div className='flex flex-col gap-0.5 rounded-xl border bg-card p-1'>
					{Array.from({ length: rowCount }).map((_, rowIndex) => (
						<TransactionRowSkeleton key={rowIndex} />
					))}
				</div>
			</div>
		))}
	</div>
)
