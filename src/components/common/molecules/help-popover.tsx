import type { FC, PropsWithChildren } from 'react'

import { HelpCircle } from 'lucide-react'

import { Button } from '@atoms/button'
import { Popover, PopoverContent, PopoverTrigger } from '@atoms/popover'

export const HelpPopover: FC<PropsWithChildren> = ({ children }) => (
	<Popover>
		<PopoverTrigger asChild>
			<Button type='button' variant='ghost' size='icon-xs' aria-label='transfer-list-help'>
				<HelpCircle />
			</Button>
		</PopoverTrigger>
		<PopoverContent className='w-72 text-sm'>{children}</PopoverContent>
	</Popover>
)
