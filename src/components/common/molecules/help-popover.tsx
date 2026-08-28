import type { ComponentProps, FC, PropsWithChildren } from 'react'

import { HelpCircle } from 'lucide-react'

import { Button } from '@atoms/button'
import { Popover, PopoverContent, PopoverTrigger } from '@atoms/popover'
import { cn } from '@cn'

interface HelpPopoverProps extends PropsWithChildren {
	open?: ComponentProps<typeof Popover>['open']
	onOpenChange?: ComponentProps<typeof Popover>['onOpenChange']
	ariaLabel?: string
	contentClassName?: string
}

export const HelpPopover: FC<HelpPopoverProps> = ({ children, open, onOpenChange, ariaLabel = 'transfer-list-help', contentClassName }) => (
	<Popover open={open} onOpenChange={onOpenChange}>
		<PopoverTrigger asChild>
			<Button type='button' variant='ghost' size='icon-xs' aria-label={ariaLabel}>
				<HelpCircle />
			</Button>
		</PopoverTrigger>
		<PopoverContent className={cn('w-72 text-sm', contentClassName)}>{children}</PopoverContent>
	</Popover>
)
