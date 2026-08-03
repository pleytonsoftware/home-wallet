import { Skeleton } from '@atoms/skeleton'

export default function HouseholdBankAccountsLoading() {
	return (
		<div className='mx-auto flex w-full flex-col gap-6 py-4 px-4 sm:px-0'>
			<div className='space-y-2'>
				<Skeleton className='h-4 w-24' />
				<Skeleton className='h-8 w-64' />
				<Skeleton className='h-4 w-96 max-w-full' />
			</div>
			<div className='grid gap-4 sm:grid-cols-2'>
				{Array.from({ length: 4 }).map((_, index) => (
					<Skeleton key={index} className='h-42 rounded-2xl' />
				))}
			</div>
		</div>
	)
}
