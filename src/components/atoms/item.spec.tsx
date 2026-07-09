import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Item, ItemGroup, ItemSeparator, ItemTitle, ItemDescription } from './item'

beforeAll(() => {
	Object.defineProperty(window, 'matchMedia', {
		writable: true,
		value: vi.fn().mockImplementation((query) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
		})),
	})
})

describe('Item components', () => {
	it('renders ItemGroup with list role and data-slot', () => {
		render(
			<ItemGroup>
				<div>child</div>
			</ItemGroup>,
		)
		const group = screen.getByRole('list')
		expect(group).toHaveAttribute('data-slot', 'item-group')
	})

	it('renders Item with default variant and size attributes', () => {
		render(<Item data-testid='item'>Content</Item>)
		const item = screen.getByTestId('item')
		expect(item).toHaveAttribute('data-slot', 'item')
		expect(item).toHaveAttribute('data-variant', 'default')
		expect(item).toHaveAttribute('data-size', 'default')
	})

	it('renders Item with custom variant and size', () => {
		render(
			<Item variant='outline' size='sm' data-testid='custom'>
				Custom
			</Item>,
		)
		const item = screen.getByTestId('custom')
		expect(item).toHaveAttribute('data-variant', 'outline')
		expect(item).toHaveAttribute('data-size', 'sm')
	})

	it('renders ItemTitle and ItemDescription inside Item', () => {
		render(
			<Item>
				<ItemTitle>Title</ItemTitle>
				<ItemDescription>Description text</ItemDescription>
			</Item>,
		)
		expect(screen.getByText('Title')).toBeInTheDocument()
		expect(screen.getByText('Description text')).toBeInTheDocument()
	})
})
