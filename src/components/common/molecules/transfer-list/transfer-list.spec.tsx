import type { ReactNode } from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TransferList } from './transfer-list'

interface Row {
	id: string
	name: string
}

const ITEMS: Row[] = [
	{ id: 'a', name: 'Alice' },
	{ id: 'b', name: 'Bob' },
	{ id: 'c', name: 'Carol' },
]

function renderList(
	assignments: Record<string, string>,
	onChange = vi.fn(),
	isItemDisabled?: (item: Row) => boolean,
	renderItemAction?: (item: Row) => ReactNode,
) {
	render(
		<TransferList<Row>
			items={ITEMS}
			getItemId={(item) => item.id}
			assignments={assignments}
			onChange={onChange}
			leftColumn={{ key: 'left', label: 'Members' }}
			rightColumn={{ key: 'right', label: 'Admins' }}
			isItemDisabled={isItemDisabled}
			renderItem={(item) => <span>{item.name}</span>}
			renderItemAction={renderItemAction}
		/>,
	)
	return onChange
}

describe('TransferList', () => {
	it('moves a selected item to the other column via the arrow button', async () => {
		const user = userEvent.setup()
		const onChange = renderList({ a: 'left', b: 'left', c: 'right' })

		await user.click(screen.getByText('Alice'))
		await user.click(screen.getByLabelText('move-selected-right'))

		expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ a: 'right', b: 'left', c: 'right' }))
	})

	it('moves multiple selected items at once', async () => {
		const user = userEvent.setup()
		const onChange = renderList({ a: 'left', b: 'left', c: 'right' })

		await user.click(screen.getByText('Alice'))
		await user.click(screen.getByText('Bob'))
		await user.click(screen.getByLabelText('move-selected-right'))

		expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ a: 'right', b: 'right' }))
	})

	it('does not fire onChange when the selection is already in the target column', async () => {
		const user = userEvent.setup()
		const onChange = renderList({ a: 'left', b: 'left', c: 'right' })

		// Carol is already on the right; moving right is a no-op.
		await user.click(screen.getByText('Carol'))
		await user.click(screen.getByLabelText('move-selected-right'))

		expect(onChange).not.toHaveBeenCalled()
	})

	describe('per-item disabling', () => {
		it('disables the row flagged by isItemDisabled', () => {
			renderList({ a: 'left', b: 'left', c: 'right' }, vi.fn(), (item) => item.id === 'a')
			expect(screen.getByText('Alice').closest('button')).toBeDisabled()
			expect(screen.getByText('Bob').closest('button')).not.toBeDisabled()
		})

		it('cannot select or move a disabled row', async () => {
			const user = userEvent.setup()
			const onChange = renderList({ a: 'left', b: 'left', c: 'right' }, vi.fn(), (item) => item.id === 'a')

			// Clicking the disabled row is a no-op; moving right does nothing.
			await user.click(screen.getByText('Alice').closest('button') as HTMLElement)
			await user.click(screen.getByLabelText('move-selected-right'))

			expect(onChange).not.toHaveBeenCalled()
		})

		it('leaves the disabled row untouched when moving other selected rows', async () => {
			const user = userEvent.setup()
			const onChange = renderList({ a: 'left', b: 'left', c: 'right' }, vi.fn(), (item) => item.id === 'a')

			await user.click(screen.getByText('Bob'))
			await user.click(screen.getByLabelText('move-selected-right'))

			const lastArgs = onChange.mock.calls.at(-1)?.[0]
			expect(lastArgs).toMatchObject({ a: 'left', b: 'right' })
		})
	})

	describe('renderItemAction', () => {
		it('renders the action next to the row without nesting it inside the toggle button', async () => {
			const onRemove = vi.fn()
			renderList({ a: 'left', b: 'left', c: 'right' }, vi.fn(), undefined, (item) => (
				<button type='button' onClick={() => onRemove(item.id)}>
					Remove {item.name}
				</button>
			))

			const removeButton = screen.getByRole('button', { name: 'Remove Alice' })
			expect(screen.getByText('Alice').closest('button')).not.toContainElement(removeButton)

			const user = userEvent.setup()
			await user.click(removeButton)

			expect(onRemove).toHaveBeenCalledWith('a')
		})

		it('does not toggle row selection when the action is clicked', async () => {
			const onChange = vi.fn()
			const user = userEvent.setup()
			renderList({ a: 'left', b: 'left', c: 'right' }, onChange, undefined, (item) => <button type='button'>Remove {item.name}</button>)

			await user.click(screen.getByRole('button', { name: 'Remove Alice' }))
			await user.click(screen.getByLabelText('move-selected-right'))

			expect(onChange).not.toHaveBeenCalled()
		})
	})
})
