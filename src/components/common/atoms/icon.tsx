import type { LucideIcon, LucideProps } from 'lucide-react'
import type { FC } from 'react'

import { cn } from '@cn'

const ICON_SIZES = {
	xs: {
		standard: 'size-3',
		force: 'size-3!',
	},
	sm: {
		standard: 'size-4',
		force: 'size-4!',
	},
	md: {
		standard: 'size-5',
		force: 'size-5!',
	},
	lg: {
		standard: 'size-6',
		force: 'size-6!',
	},
	xl: {
		standard: 'size-8',
		force: 'size-8!',
	},
} as const

type IconSize = keyof typeof ICON_SIZES

type IconProps = LucideProps & {
	IconComponent: LucideIcon
	/**
	 * The size of the icon. Defaults to 'md'.
	 * @default 'md'
	 * @enum 'xs' | 'sm' | 'md' | 'lg' | 'xl'
	 */
	size?: IconSize
	/**
	 * If true, the icon will be forced to the size specified by `size`, ignoring any parent styles. If false, the icon will inherit its size from its parent.
	 * This is useful for icons that are used in buttons or other components that have a fixed size, but you want the icon to be a specific size regardless of the button size.
	 */
	forceSize?: boolean
}

export const Icon: FC<IconProps> = ({ IconComponent, forceSize, className, size = 'md', ...iconProps }) => (
	<IconComponent className={cn(ICON_SIZES[size][forceSize ? 'force' : 'standard'], className)} {...iconProps} />
)
