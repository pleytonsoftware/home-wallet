'use client'

import { Collapsible as CollapsiblePrimitive } from 'radix-ui'

import { cn } from '@cn'

function Collapsible({ ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
	return <CollapsiblePrimitive.Root data-slot='collapsible' {...props} />
}

function CollapsibleTrigger({ ...props }: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
	return <CollapsiblePrimitive.CollapsibleTrigger data-slot='collapsible-trigger' {...props} />
}

function CollapsibleContent({
	animate = false,
	className,
	...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent> & { animate?: boolean }) {
	return (
		<CollapsiblePrimitive.CollapsibleContent
			data-slot='collapsible-content'
			className={cn(
				animate && 'overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up',
				className,
			)}
			{...props}
		/>
	)
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
