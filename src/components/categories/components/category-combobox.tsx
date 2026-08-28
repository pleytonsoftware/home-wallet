'use client'

import type { CategorySummary } from '@categories/types'
import type { ComponentProps, FC } from 'react'

import { useCallback, useDeferredValue, useMemo, useRef, useState } from 'react'

import { PlusIcon, TagIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList, ComboboxTrigger, ComboboxValue } from '@atoms/combobox'
import { Icon } from '@atoms/icon'
import { CategoryBadge } from '@categories/components/category-badge'
import { CATEGORY_COLOR_CLASSES } from '@categories/constants/colors'
import { CATEGORY_ICON_COMPONENTS } from '@categories/constants/icons'
import { CATEGORIES_QUERY_KEYS } from '@categories/constants/query-keys'
import { createCategoryMutationOptions } from '@categories/hooks/mutations/create-category.hook'
import { getCategoriesOptions } from '@categories/hooks/queries/get-categories-option'
import { useCategoryDisplayName } from '@categories/hooks/use-category-display-name.hook'
import { hashCategoryColor, hashCategoryIcon } from '@categories/utils'
import { cn } from '@cn'
import { CATEGORY_COLOR } from '@lib/constants/category-color.enum'
import { CATEGORY_ICON } from '@lib/constants/category-icon.enum'
import { logger } from '@lib/logger'
import { isIncomeCategory } from '@lib/utils/category.utils'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface CategoryComboboxProps extends Pick<ComponentProps<typeof ComboboxContent>, 'container'> {
	id?: string
	name?: string
	householdId: string
	value?: string | null
	onChange: (categoryId: string | null) => void
	disabled?: boolean
	excludeIncomeCategory?: boolean
	triggerClassName?: string
}

const CATEGORY_COLORS = Object.values(CATEGORY_COLOR)
const CATEGORY_ICONS = Object.values(CATEGORY_ICON)

export const CategoryCombobox: FC<CategoryComboboxProps> = ({
	id,
	name,
	householdId,
	value,
	onChange,
	disabled,
	container,
	excludeIncomeCategory,
	triggerClassName,
}) => {
	const t = useTranslations('common.fields.category')
	const getCategoryDisplayName = useCategoryDisplayName()
	const [query, setQuery] = useState('')
	const [pickedColor, setPickedColor] = useState<CATEGORY_COLOR | null>(null)
	const [pickedIcon, setPickedIcon] = useState<CATEGORY_ICON | null>(null)
	const queryClient = useQueryClient()
	const inputRef = useRef<HTMLInputElement>(null)

	const { data: allCategories = [] } = useQuery(getCategoriesOptions(householdId))
	const categories = useMemo(
		() => (excludeIncomeCategory ? allCategories.filter((category) => !isIncomeCategory(category)) : allCategories),
		[allCategories, excludeIncomeCategory],
	)

	const deferredQuery = useDeferredValue(query)
	const trimmedQuery = deferredQuery.trim()

	const filtered = useMemo(() => {
		if (!trimmedQuery) return categories
		const lower = trimmedQuery.toLowerCase()
		return categories.filter((category) => category.name.toLowerCase().includes(lower))
	}, [categories, trimmedQuery])

	const selected = useMemo(() => categories.find((category) => category.id === value) ?? null, [categories, value])

	const hasExactMatch = categories.some((category) => category.name.toLowerCase() === trimmedQuery.toLowerCase())
	const canCreate = trimmedQuery.length > 0 && !hasExactMatch
	const activeColor = pickedColor ?? (trimmedQuery ? hashCategoryColor(trimmedQuery) : CATEGORY_COLOR.GRAY)
	const activeIcon = pickedIcon ?? (trimmedQuery ? hashCategoryIcon(trimmedQuery) : CATEGORY_ICON.TAG)

	const resetCreateState = () => {
		setQuery('')
		setPickedColor(null)
		setPickedIcon(null)
	}

	const createMutation = useMutation({
		...createCategoryMutationOptions(householdId),
		onSuccess: async (res) => {
			if (!res.success) {
				toast.error(typeof res.error === 'string' ? res.error : t('create.error'))
				return
			}
			await queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEYS.categories(householdId) })
			onChange(res.data.id)
			resetCreateState()
		},
		onError: (err) => {
			logger.error('An error has ocurred: {err}', { err })
			toast.error(err instanceof Error ? err.message : t('create.error'))
		},
	})

	const handleCreate = useCallback(() => {
		if (!trimmedQuery) return
		createMutation.mutate({ name: trimmedQuery, color: activeColor, icon: activeIcon })
	}, [trimmedQuery, activeColor, activeIcon, createMutation])

	return (
		<Combobox<CategorySummary>
			items={filtered}
			itemToStringValue={(category) => category?.name ?? ''}
			itemToStringLabel={(category) => category?.name ?? ''}
			onValueChange={(next) => onChange(next?.id ?? null)}
			onOpenChange={(nextOpen) => {
				// Keyboard-only flow: opening via Enter/Space on the trigger should move focus straight
				// into the search input, not leave it stranded on the (now-hidden) trigger button.
				if (nextOpen) requestAnimationFrame(() => inputRef.current?.focus())
			}}
			disabled={disabled}
			modal={!!container}
			value={selected}
		>
			<ComboboxTrigger
				id={id}
				name={name}
				disabled={disabled}
				className={cn('w-full flex justify-between rounded-md border border-input bg-transparent px-2.5 py-1.5 shadow-xs', triggerClassName)}
			>
				<ComboboxValue placeholder={t('placeholder')}>
					{(category: CategorySummary | null) =>
						category ? (
							<CategoryBadge name={getCategoryDisplayName(category)} color={category.color} icon={category.icon} />
						) : (
							<span className='flex items-center gap-1.5 text-muted-foreground'>
								<Icon IconComponent={TagIcon} size='xs' />
								{t('placeholder')}
							</span>
						)
					}
				</ComboboxValue>
			</ComboboxTrigger>
			<ComboboxContent container={container}>
				<ComboboxInput
					ref={inputRef}
					placeholder={t('search-placeholder')}
					showTrigger={false}
					onChange={(e) => {
						setQuery(e.target.value)
						setPickedColor(null)
						setPickedIcon(null)
					}}
					disabled={disabled}
				/>
				<ComboboxEmpty>
					{canCreate ? (
						<div className='flex flex-col gap-2 p-1'>
							<button
								type='button'
								onClick={handleCreate}
								disabled={createMutation.isPending}
								className='flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent disabled:pointer-events-none disabled:opacity-50'
							>
								<Icon IconComponent={PlusIcon} size='sm' className='shrink-0 text-muted-foreground' />
								{t('create.trigger', { name: trimmedQuery })}
							</button>
							<div className='flex flex-wrap gap-1.5 px-2'>
								{CATEGORY_COLORS.map((color) => (
									<button
										key={color}
										type='button'
										aria-label={color}
										aria-pressed={activeColor === color}
										onClick={() => setPickedColor(color)}
										className={cn(
											'size-4 rounded-full ring-offset-2 ring-offset-popover transition-shadow',
											CATEGORY_COLOR_CLASSES[color].swatch,
											activeColor === color && 'ring-2 ring-foreground',
										)}
									/>
								))}
							</div>
							<div className='flex flex-wrap gap-1.5 px-2 pb-1'>
								{CATEGORY_ICONS.map((icon) => {
									const IconComponent = CATEGORY_ICON_COMPONENTS[icon]
									return (
										<button
											key={icon}
											type='button'
											aria-label={icon}
											aria-pressed={activeIcon === icon}
											onClick={() => setPickedIcon(icon)}
											className={cn(
												'flex size-6 items-center justify-center rounded-sm text-muted-foreground transition-colors hover:bg-accent',
												activeIcon === icon && 'bg-accent text-foreground ring-1 ring-foreground/30',
											)}
										>
											<Icon IconComponent={IconComponent} size='xs' />
										</button>
									)
								})}
							</div>
						</div>
					) : (
						t('empty')
					)}
				</ComboboxEmpty>
				<ComboboxList>
					{(category: CategorySummary) => (
						<ComboboxItem key={category.id} value={category} title={category.name}>
							<CategoryBadge name={getCategoryDisplayName(category)} color={category.color} icon={category.icon} />
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	)
}
