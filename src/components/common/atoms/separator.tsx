'use client'

import * as React from 'react'

import { Separator as SeparatorPrimitive } from 'radix-ui'

import { cn } from '@cn'

type SeparatorProps = React.ComponentProps<typeof SeparatorPrimitive.Root>

function Separator({ className, orientation = 'horizontal', decorative = true, children, ...props }: SeparatorProps) {
	if (children) {
		return (
			<div
				data-slot='separator'
				data-orientation={orientation}
				className={cn('flex items-center gap-2 data-[orientation=vertical]:flex-col', className)}
			>
				<SeparatorPrimitive.Root
					decorative={decorative}
					orientation={orientation}
					className='shrink-0 bg-border data-horizontal:h-px data-horizontal:flex-1 data-vertical:w-px data-vertical:flex-1'
				/>
				<span className='shrink-0 text-xs text-muted-foreground uppercase'>{children}</span>
				<SeparatorPrimitive.Root
					decorative={decorative}
					orientation={orientation}
					className='shrink-0 bg-border data-horizontal:h-px data-horizontal:flex-1 data-vertical:w-px data-vertical:flex-1'
				/>
			</div>
		)
	}

	return (
		<SeparatorPrimitive.Root
			data-slot='separator'
			decorative={decorative}
			orientation={orientation}
			className={cn('shrink-0 bg-border data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch', className)}
			{...props}
		/>
	)
}

export { Separator }
