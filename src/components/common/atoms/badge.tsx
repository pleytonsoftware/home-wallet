import type { VariantProps } from 'class-variance-authority'
import type { FC } from 'react'

import { cva } from 'class-variance-authority'

import { cn } from '@cn'

const badgeVariants = cva(
	'inline-flex w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full border border-transparent px-2 py-0.5 text-xs font-medium',
	{
		variants: {
			variant: {
				default: 'bg-primary/10 text-primary',
				secondary: 'bg-secondary text-secondary-foreground',
				outline: 'border-border text-foreground',
				destructive: 'bg-destructive/10 text-destructive',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
)

interface BadgeProps extends React.ComponentProps<'span'>, VariantProps<typeof badgeVariants> {}

const Badge: FC<BadgeProps> = ({ className, variant, ...props }) => (
	<span data-slot='badge' className={cn(badgeVariants({ variant, className }))} {...props} />
)

export { Badge, badgeVariants }
