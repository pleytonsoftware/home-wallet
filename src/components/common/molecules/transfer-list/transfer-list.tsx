'use client'

import type { DragEndEvent } from '@dnd-kit/react'
import type { ReactNode } from 'react'

import { useCallback, useMemo, useState } from 'react'

import { ArrowLeft, ArrowRight } from 'lucide-react'

import { Button } from '@atoms/button'
import { cn } from '@cn'
import { DragDropProvider, useDraggable, useDroppable } from '@dnd-kit/react'

export interface TransferListColumn<S extends string = string> {
	/** Stable identifier persisted through `assignments`. */
	key: S
	label: ReactNode
}

export interface TransferListProps<T, S extends string = string> {
	items: T[]
	getItemId: (item: T) => string
	/** Controlled map of `itemId -> columnKey`. */
	assignments: Record<string, S>
	onChange: (assignments: Record<string, S>) => void
	leftColumn: TransferListColumn<S>
	rightColumn: TransferListColumn<S>
	renderItem: (item: T) => ReactNode
	/** Optional trailing content rendered next to (not inside) the row's toggle button — for row-level actions like a destructive remove button. */
	renderItemAction?: (item: T) => ReactNode
	disabled?: boolean
	/** Per-item lock: when it returns `true`, the item can't be selected, moved or dragged. */
	isItemDisabled?: (item: T) => boolean
	className?: string
}

/**
 * Generic two-column transfer list. Items can be moved between columns by
 * multi-selecting rows and using the arrow buttons, or by dragging a row onto
 * the other column. Fully controlled via `assignments` + `onChange`.
 */
export function TransferList<T, S extends string = string>({
	items,
	getItemId,
	assignments,
	onChange,
	leftColumn,
	rightColumn,
	renderItem,
	renderItemAction,
	disabled,
	isItemDisabled,
	className,
}: TransferListProps<T, S>) {
	const [selected, setSelected] = useState<Set<string>>(new Set())

	const disabledIds = useMemo(() => {
		if (!isItemDisabled) return new Set<string>()
		return new Set(items.filter((item) => isItemDisabled(item)).map(getItemId))
	}, [items, isItemDisabled, getItemId])

	const columns = useMemo(() => {
		const grouped: Record<string, T[]> = { [leftColumn.key]: [], [rightColumn.key]: [] }
		for (const item of items) {
			const id = getItemId(item)
			const columnKey = assignments[id] === rightColumn.key ? rightColumn.key : leftColumn.key
			grouped[columnKey].push(item)
		}
		return grouped
	}, [items, assignments, getItemId, leftColumn.key, rightColumn.key])

	const toggleSelected = useCallback((id: string) => {
		setSelected((prev) => {
			const next = new Set(prev)
			if (next.has(id)) {
				next.delete(id)
			} else {
				next.add(id)
			}
			return next
		})
	}, [])

	const moveItems = useCallback(
		(ids: string[], toColumn: S) => {
			const movable = ids.filter((id) => !disabledIds.has(id))
			if (movable.length === 0) return
			const next = { ...assignments }
			for (const id of movable) {
				next[id] = toColumn
			}
			onChange(next)
			setSelected(new Set())
		},
		[assignments, onChange, disabledIds],
	)

	const moveSelectedTo = useCallback(
		(toColumn: S) => {
			const ids = [...selected].filter((id) => (assignments[id] ?? leftColumn.key) !== toColumn)
			moveItems(ids, toColumn)
		},
		[selected, assignments, leftColumn.key, moveItems],
	)

	const handleDragEnd = useCallback(
		(event: DragEndEvent) => {
			if (event.canceled) return
			const sourceId = event.operation.source?.id
			const targetKey = event.operation.target?.id
			if (sourceId == null || targetKey == null) return

			const toColumn = String(targetKey) as S
			if (toColumn !== leftColumn.key && toColumn !== rightColumn.key) return

			const draggedId = String(sourceId)
			// If the dragged row is part of the current selection, move the whole selection.
			const ids = selected.has(draggedId) ? [...selected] : [draggedId]
			moveItems(
				ids.filter((id) => (assignments[id] ?? leftColumn.key) !== toColumn),
				toColumn,
			)
		},
		[assignments, selected, leftColumn.key, rightColumn.key, moveItems],
	)

	return (
		<DragDropProvider onDragEnd={handleDragEnd}>
			<div className={cn('grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch', className)}>
				<TransferColumn
					column={leftColumn}
					items={columns[leftColumn.key]}
					getItemId={getItemId}
					renderItem={renderItem}
					renderItemAction={renderItemAction}
					selected={selected}
					onToggle={toggleSelected}
					disabled={disabled}
					disabledIds={disabledIds}
				/>

				<div className='flex flex-row items-center justify-center gap-2 sm:flex-col [&_button>svg]:rotate-90 [&_button>svg]:sm:rotate-0'>
					<Button
						type='button'
						variant='outline'
						size='icon-sm'
						disabled={disabled || selected.size === 0}
						onClick={() => moveSelectedTo(rightColumn.key)}
						aria-label='move-selected-right'
					>
						<ArrowRight />
					</Button>
					<Button
						type='button'
						variant='outline'
						size='icon-sm'
						disabled={disabled || selected.size === 0}
						onClick={() => moveSelectedTo(leftColumn.key)}
						aria-label='move-selected-left'
					>
						<ArrowLeft />
					</Button>
				</div>

				<TransferColumn
					column={rightColumn}
					items={columns[rightColumn.key]}
					getItemId={getItemId}
					renderItem={renderItem}
					renderItemAction={renderItemAction}
					selected={selected}
					onToggle={toggleSelected}
					disabled={disabled}
					disabledIds={disabledIds}
				/>
			</div>
		</DragDropProvider>
	)
}

interface TransferColumnProps<T> {
	column: TransferListColumn
	items: T[]
	getItemId: (item: T) => string
	renderItem: (item: T) => ReactNode
	renderItemAction?: (item: T) => ReactNode
	selected: Set<string>
	onToggle: (id: string) => void
	disabled?: boolean
	disabledIds: Set<string>
}

function TransferColumn<T>({
	column,
	items,
	getItemId,
	renderItem,
	renderItemAction,
	selected,
	onToggle,
	disabled,
	disabledIds,
}: TransferColumnProps<T>) {
	const { ref, isDropTarget } = useDroppable({ id: column.key, disabled })

	return (
		<div
			ref={ref}
			className={cn(
				'flex min-h-40 flex-col gap-2 rounded-xl border bg-background p-3 transition-colors',
				isDropTarget && 'border-primary ring-1 ring-primary/30',
			)}
		>
			<div className='flex items-center justify-between gap-2 px-1'>
				<span className='text-sm font-medium'>
					{column.label}
					<span className='text-muted-foreground'> · {items.length}</span>
				</span>
			</div>

			<ul className='flex flex-col gap-1.5'>
				{items.map((item) => {
					const id = getItemId(item)
					return (
						<TransferItem
							key={id}
							id={id}
							isSelected={selected.has(id)}
							onToggle={onToggle}
							disabled={disabled || disabledIds.has(id)}
							action={renderItemAction?.(item)}
						>
							{renderItem(item)}
						</TransferItem>
					)
				})}
			</ul>
		</div>
	)
}

interface TransferItemProps {
	id: string
	isSelected: boolean
	onToggle: (id: string) => void
	disabled?: boolean
	children: ReactNode
	/** Rendered as a sibling of the toggle button, not inside it — keeps interactive actions out of the button's own click/drag handling. */
	action?: ReactNode
}

function TransferItem({ id, isSelected, onToggle, disabled, children, action }: TransferItemProps) {
	const { ref, isDragging } = useDraggable({ id, disabled })

	return (
		<li className='flex items-center gap-1'>
			<button
				ref={ref}
				type='button'
				aria-pressed={isSelected}
				disabled={disabled}
				onClick={() => onToggle(id)}
				className={cn(
					'flex flex-1 items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm transition-colors',
					'hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
					isSelected ? 'border-primary bg-primary/5' : 'border-transparent bg-muted/40',
					isDragging && 'opacity-50',
					disabled ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing',
				)}
			>
				{children}
			</button>
			{action}
		</li>
	)
}
