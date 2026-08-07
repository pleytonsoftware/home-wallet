'use client'

import type { CategorySummary } from '@categories/types'
import type { ComponentProps, FC } from 'react'

import { useCallback, useDeferredValue, useMemo, useState } from 'react'

import { PlusIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@atoms/combobox'
import { Icon } from '@atoms/icon'
import { CategoryBadge } from '@categories/components/category-badge'
import { CATEGORY_COLOR_CLASSES } from '@categories/constants/colors'
import { CATEGORIES_QUERY_KEYS } from '@categories/constants/query-keys'
import { createCategoryMutationOptions } from '@categories/hooks/mutations/create-category.hook'
import { getCategoriesOptions } from '@categories/hooks/queries/get-categories-option'
import { hashCategoryColor } from '@categories/utils'
import { cn } from '@cn'
import { CATEGORY_COLOR } from '@lib/constants/category-color.enum'
import { logger } from '@lib/logger'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface CategoryComboboxProps extends Pick<ComponentProps<typeof ComboboxContent>, 'container'> {
	id?: string
	name?: string
	householdId: string
	value?: string | null
	onChange: (categoryId: string | null) => void
	disabled?: boolean
}

const CATEGORY_COLORS = Object.values(CATEGORY_COLOR)

// TODO: Add a way to include a loading state for the combobox, so that when the categories are being fetched, we can show a loading indicator instead of an empty state. This will improve the user experience and make it clear that data is being loaded.
export const CategoryCombobox: FC<CategoryComboboxProps> = ({ id, name, householdId, value, onChange, disabled, container }) => {
	const t = useTranslations('common.fields.category')
	const [query, setQuery] = useState('')
	const [pickedColor, setPickedColor] = useState<CATEGORY_COLOR | null>(null)
	const queryClient = useQueryClient()

	const { data: categories = [] } = useQuery(getCategoriesOptions(householdId))

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

	const createMutation = useMutation({
		...createCategoryMutationOptions(householdId),
		onSuccess: async (res) => {
			if (!res.success) {
				toast.error(typeof res.error === 'string' ? res.error : t('create.error'))
				return
			}
			await queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEYS.categories(householdId) })
			onChange(res.data.id)
			setQuery('')
			setPickedColor(null)
		},
		onError: (err) => {
			logger.error('An error has ocurred: {err}', { err })
			toast.error(err instanceof Error ? err.message : t('create.error'))
		},
	})

	const handleCreate = useCallback(() => {
		if (!trimmedQuery) return
		createMutation.mutate({ name: trimmedQuery, color: activeColor })
	}, [trimmedQuery, activeColor, createMutation])

	return (
		<Combobox<CategorySummary>
			items={filtered}
			itemToStringValue={(category) => category?.name ?? ''}
			itemToStringLabel={(category) => category?.name ?? ''}
			onValueChange={(next) => onChange(next?.id ?? null)}
			disabled={disabled}
			modal={!!container}
			value={selected}
		>
			<ComboboxInput
				id={id}
				name={name}
				placeholder={t('placeholder')}
				onChange={(e) => {
					setQuery(e.target.value)
					setPickedColor(null)
				}}
				disabled={disabled}
			/>
			<ComboboxContent container={container}>
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
							<div className='flex flex-wrap gap-1.5 px-2 pb-1'>
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
						</div>
					) : (
						t('empty')
					)}
				</ComboboxEmpty>
				<ComboboxList>
					{(category: CategorySummary) => (
						<ComboboxItem key={category.id} value={category} title={category.name}>
							<CategoryBadge name={category.name} color={category.color} />
						</ComboboxItem>
					)}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	)
}
