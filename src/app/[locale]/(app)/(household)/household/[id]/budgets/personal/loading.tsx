import { Skeleton } from '@atoms/skeleton'

export default function HouseholdBudgetsPersonalLoading() {
	return (
		<div className='mx-auto flex w-full flex-col gap-6 py-4 px-4 sm:px-0'>
			<div className='space-y-2'>
				<Skeleton className='h-4 w-24' />
				<Skeleton className='h-8 w-64' />
				<Skeleton className='h-4 w-96 max-w-full' />
			</div>
			<div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
				{Array.from({ length: 12 }).map((_, index) => (
					<Skeleton key={index} className='h-24 rounded-2xl' />
				))}
			</div>
		</div>
	)
}
