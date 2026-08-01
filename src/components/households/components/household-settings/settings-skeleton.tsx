import type { FC } from 'react'

import { Skeleton } from '@atoms/skeleton'
import { cn } from '@cn'

/** Card chrome matching {@link SettingsSection} so skeletons line up with the real content. */
const SkeletonCard: FC<React.PropsWithChildren<{ className?: string }>> = ({ className, children }) => (
	<section className={cn('flex flex-col gap-5 rounded-2xl border bg-card p-5 shadow-xs', className)}>
		<header className='flex flex-col gap-2'>
			<Skeleton className='h-5 w-40' />
			<Skeleton className='h-4 w-64 max-w-full' />
		</header>
		{children}
	</section>
)

/** One labelled field placeholder (label + control). */
const FieldSkeleton: FC = () => (
	<div className='flex flex-col gap-2'>
		<Skeleton className='h-4 w-28' />
		<Skeleton className='h-9 w-full' />
		<Skeleton className='h-3 w-48 max-w-full' />
	</div>
)

/** Loading placeholder for a form-style settings page (e.g. General). */
export const SettingsFormSkeleton: FC<{ rows?: number }> = ({ rows = 5 }) => (
	<SkeletonCard>
		<div className='flex flex-col gap-6'>
			{Array.from({ length: rows }).map((_, index) => (
				<FieldSkeleton key={index} />
			))}
		</div>
		<div className='flex justify-end border-t pt-4'>
			<Skeleton className='h-9 w-28' />
		</div>
	</SkeletonCard>
)

/** Loading placeholder for the two-column members/roles transfer list. */
export const SettingsTransferSkeleton: FC = () => (
	<SkeletonCard>
		<div className='grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch'>
			{[0, 1].map((column) => (
				<div key={column} className={cn('flex min-h-40 flex-col gap-2 rounded-xl border bg-background p-3', column === 1 && 'sm:order-3')}>
					<Skeleton className='mb-1 h-4 w-24' />
					{Array.from({ length: 3 }).map((_, index) => (
						<Skeleton key={index} className='h-9 w-full' />
					))}
				</div>
			))}
			<div className='flex flex-row items-center justify-center gap-2 sm:order-2 sm:flex-col'>
				<Skeleton className='size-8 rounded-md' />
				<Skeleton className='size-8 rounded-md' />
			</div>
		</div>
		<div className='flex justify-end border-t pt-4'>
			<Skeleton className='h-9 w-28' />
		</div>
	</SkeletonCard>
)

/** Loading placeholder for the danger zone (stacked action rows). */
export const SettingsDangerSkeleton: FC = () => (
	<SkeletonCard className='border-destructive/40'>
		<div className='flex flex-col gap-4'>
			{Array.from({ length: 3 }).map((_, index) => (
				<div key={index} className={cn('flex items-center justify-between gap-2', index > 0 && 'border-t pt-4')}>
					<div className='flex flex-col gap-2'>
						<Skeleton className='h-4 w-32' />
						<Skeleton className='h-3 w-56 max-w-full' />
					</div>
					<Skeleton className='h-9 w-32' />
				</div>
			))}
		</div>
	</SkeletonCard>
)
