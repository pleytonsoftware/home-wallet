import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ToggleGroup, ToggleGroupItem } from './toggle-group'

describe('ToggleGroup', () => {
	it('renders a radiogroup for type="single" and only allows one item pressed at a time', async () => {
		const user = userEvent.setup()
		render(
			<ToggleGroup type='single' defaultValue='bold'>
				<ToggleGroupItem value='bold'>Bold</ToggleGroupItem>
				<ToggleGroupItem value='italic'>Italic</ToggleGroupItem>
			</ToggleGroup>,
		)

		expect(screen.getByRole('radiogroup')).toHaveAttribute('data-slot', 'toggle-group')
		const [bold, italic] = screen.getAllByRole('radio')
		expect(bold).toHaveAttribute('aria-checked', 'true')
		expect(italic).toHaveAttribute('aria-checked', 'false')

		await user.click(italic)

		expect(bold).toHaveAttribute('aria-checked', 'false')
		expect(italic).toHaveAttribute('aria-checked', 'true')
	})

	it('renders a toolbar for type="multiple" and allows several items pressed at once', async () => {
		const user = userEvent.setup()
		render(
			<ToggleGroup type='multiple'>
				<ToggleGroupItem value='bold'>Bold</ToggleGroupItem>
				<ToggleGroupItem value='italic'>Italic</ToggleGroupItem>
			</ToggleGroup>,
		)

		expect(screen.getByRole('toolbar')).toHaveAttribute('data-slot', 'toggle-group')
		const [bold, italic] = screen.getAllByRole('button')

		await user.click(bold)
		await user.click(italic)

		expect(bold).toHaveAttribute('aria-pressed', 'true')
		expect(italic).toHaveAttribute('aria-pressed', 'true')
	})

	it('defaults to horizontal orientation with spacing 2', () => {
		render(
			<ToggleGroup type='single'>
				<ToggleGroupItem value='bold'>Bold</ToggleGroupItem>
			</ToggleGroup>,
		)

		const group = screen.getByRole('radiogroup')
		expect(group).toHaveAttribute('data-orientation', 'horizontal')
		expect(group).toHaveAttribute('data-spacing', '2')
	})

	it('applies the given orientation and spacing to the group and its items', () => {
		render(
			<ToggleGroup type='single' orientation='vertical' spacing={0}>
				<ToggleGroupItem value='bold'>Bold</ToggleGroupItem>
			</ToggleGroup>,
		)

		expect(screen.getByRole('radiogroup')).toHaveAttribute('data-orientation', 'vertical')
		expect(screen.getByRole('radio')).toHaveAttribute('data-spacing', '0')
	})

	it('propagates the group variant and size to items that do not set their own', () => {
		render(
			<ToggleGroup type='single' variant='outline' size='lg'>
				<ToggleGroupItem value='bold'>Bold</ToggleGroupItem>
			</ToggleGroup>,
		)

		const item = screen.getByRole('radio')
		expect(item).toHaveAttribute('data-variant', 'outline')
		expect(item).toHaveAttribute('data-size', 'lg')
		expect(item).toHaveClass('border', 'border-input', 'h-10', 'min-w-10')
	})

	it('merges a custom className on the group', () => {
		render(
			<ToggleGroup type='single' className='ml-auto'>
				<ToggleGroupItem value='bold'>Bold</ToggleGroupItem>
			</ToggleGroup>,
		)

		expect(screen.getByRole('radiogroup')).toHaveClass('ml-auto')
	})
})
