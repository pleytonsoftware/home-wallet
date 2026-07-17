import type { FC, PropsWithChildren } from 'react'

import { ArrowRight, Users } from 'lucide-react'

import { Button } from '@atoms/button'
import { Icon } from '@atoms/icon'
import { HouseholdJoinDrawer } from '@households/components/household-join/household-join-drawer'

interface HouseholdJoinBannerProps {
	title: string
	description: string
	cta: string
}

export const HouseholdJoinBanner: FC<PropsWithChildren<HouseholdJoinBannerProps>> = ({ title, description, cta }) => (
	<div className='flex flex-col items-start justify-between gap-4 rounded-2xl border bg-card p-5 sm:flex-row sm:items-center'>
		<div className='flex items-center gap-3'>
			<span className='flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground'>
				<Icon IconComponent={Users} size='md' />
			</span>
			<div>
				<p className='font-semibold'>{title}</p>
				<p className='text-sm text-muted-foreground'>{description}</p>
			</div>
		</div>
		<HouseholdJoinDrawer
			trigger={
				<Button variant='outline' icon={<Icon IconComponent={ArrowRight} size='sm' />} iconPosition='end' className='w-full sm:w-auto'>
					{cta}
				</Button>
			}
		/>
	</div>
)
