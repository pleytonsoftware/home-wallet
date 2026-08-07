import type { CATEGORY_COLOR } from '@lib/constants/category-color.enum'
import type { FC } from 'react'

import { Badge } from '@atoms/badge'
import { CATEGORY_COLOR_CLASSES } from '@categories/constants/colors'
import { cn } from '@cn'

interface CategoryBadgeProps {
	name: string
	color: CATEGORY_COLOR
	className?: string
}

export const CategoryBadge: FC<CategoryBadgeProps> = ({ name, color, className }) => (
	<Badge variant='outline' className={cn('border-transparent', CATEGORY_COLOR_CLASSES[color].badge, className)}>
		{name}
	</Badge>
)
