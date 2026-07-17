import type { FC, PropsWithChildren } from 'react'

import { Plus } from 'lucide-react'
import { useSession } from 'next-auth/react'

import { Button } from '@atoms/button'
import { Icon } from '@atoms/icon'
import { HouseholdCreate } from '@households/components/household-create'

interface HouseholdEmptyCardProps {
	href: string
	title: string
	description: string
}

export const HouseholdEmptyCard: FC<PropsWithChildren<HouseholdEmptyCardProps>> = ({ href, title, description }) => {
	const session = useSession()
	// TODO: add a limit to number of households a user can create
	// TODO: householdIds are returning empty array
	const disabled = typeof session.data?.user?.householdIds?.length === 'number' ? session.data?.user?.householdIds?.length >= 1 : true

	return (
		<HouseholdCreate
			trigger={
				<Button
					href={href}
					variant='link'
					className='flex min-h-42 flex-col no-underline! items-center justify-center gap-2 rounded-2xl border border-dashed border-grey/100 p-5 text-center transition-colors hover:border-primary/50 hover:shadow hover:bg-muted/40 h-full'
					disabled={disabled}
				>
					{/* // TODO: add a tooltip to explain why the user can't create more households if they have reached the limit */}
					{/* // TODO: add a sheet/modal to create a household instead of redirecting to a new page */}
					<span className='flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground'>
						<Icon IconComponent={Plus} size='md' />
					</span>
					<p className='font-semibold'>{title}</p>
					<p className='text-sm text-muted-foreground'>{description}</p>
				</Button>
			}
		/>
	)
}
