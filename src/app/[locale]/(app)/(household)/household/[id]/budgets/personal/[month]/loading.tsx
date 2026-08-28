import { Skeleton } from '@atoms/skeleton'

export default function HouseholdBudgetsPersonalMonthLoading() {
	return (
		<div className='mx-auto flex w-full flex-col gap-6 py-4 px-4 sm:px-0'>
			<div className='space-y-2'>
				<Skeleton className='h-4 w-24' />
				<Skeleton className='h-8 w-64' />
				<Skeleton className='h-4 w-96 max-w-full' />
			</div>
			<Skeleton className='h-24 rounded-2xl' />
		</div>
	)
}
