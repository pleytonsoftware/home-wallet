import type { FC, ReactNode } from 'react'

import { FieldError } from '@atoms/field'

interface DangerZoneRowProps {
	label: string
	description: string
	action: ReactNode
	error?: string
	children?: ReactNode
}

export const DangerZoneRow: FC<DangerZoneRowProps> = ({ label, description, action, error, children }) => (
	<div className='flex flex-col gap-2'>
		<div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
			<div>
				<p className='text-sm font-medium'>{label}</p>
				<p className='text-sm text-muted-foreground'>{description}</p>
				{children}
			</div>
			{action}
		</div>
		{error && <FieldError>{error}</FieldError>}
	</div>
)
