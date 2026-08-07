import type { MonthTile } from '@monthly-budgets/types'
import type { FC } from 'react'

import { CheckIcon, CircleIcon, CircleSlashIcon, LockIcon } from 'lucide-react'

import { Icon } from '@atoms/icon'

interface StatusIconProps {
	status: MonthTile['status']
}

export const StatusIcon: FC<StatusIconProps> = ({ status }) => {
	if (status === 'created') {
		return (
			<span className='flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground'>
				<Icon IconComponent={CheckIcon} size='xs' />
			</span>
		)
	}

	if (status === 'available') {
		return (
			<span className='flex size-5 shrink-0 items-center justify-center rounded-full border border-dashed border-primary text-primary'>
				<Icon IconComponent={CircleIcon} size='xs' className='fill-current' />
			</span>
		)
	}

	if (status === 'locked') {
		return <Icon IconComponent={LockIcon} size='xs' className='shrink-0 text-muted-foreground' />
	}

	return <Icon IconComponent={CircleSlashIcon} size='xs' className='shrink-0 text-muted-foreground/60' />
}
