import type { LucideIcon, LucideProps } from 'lucide-react'
import type { FC } from 'react'

import { cn } from '@cn'

const ICON_SIZES = {
	xs: 'size-3',
	sm: 'size-4',
	md: 'size-5',
	lg: 'size-6',
	xl: 'size-8',
} as const

type IconSize = keyof typeof ICON_SIZES

type IconProps = LucideProps & {
	IconComponent: LucideIcon
	size?: IconSize
}

export const Icon: FC<IconProps> = ({ IconComponent, className, size = 'md', ...iconProps }) => (
	<IconComponent className={cn(ICON_SIZES[size], className)} {...iconProps} />
)
