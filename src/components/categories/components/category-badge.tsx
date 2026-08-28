import type { CATEGORY_COLOR } from '@lib/constants/category-color.enum'
import type { CATEGORY_ICON } from '@lib/constants/category-icon.enum'
import type { FC } from 'react'

import { Icon } from '@atoms/icon'
import { CATEGORY_COLOR_CLASSES } from '@categories/constants/colors'
import { CATEGORY_ICON_COMPONENTS } from '@categories/constants/icons'
import { cn } from '@cn'

interface CategoryBadgeProps {
	name: string
	color: CATEGORY_COLOR
	icon: CATEGORY_ICON
	className?: string
}

export const CategoryBadge: FC<CategoryBadgeProps> = ({ name, color, icon, className }) => (
	<span className={cn('flex items-center gap-1.5 truncate', className)}>
		<Icon IconComponent={CATEGORY_ICON_COMPONENTS[icon]} size='xs' className={cn(CATEGORY_COLOR_CLASSES[color].badge, 'p-1 size-6 rounde-')} />
		{name}
	</span>
)
