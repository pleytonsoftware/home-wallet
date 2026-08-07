import { render, screen } from '@testing-library/react'

import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from './button-group'

describe('ButtonGroup', () => {
	it('renders with the group role and button-group data-slot', () => {
		render(
			<ButtonGroup>
				<button>One</button>
				<button>Two</button>
			</ButtonGroup>,
		)

		expect(screen.getByRole('group')).toHaveAttribute('data-slot', 'button-group')
	})

	it('renders its children', () => {
		render(
			<ButtonGroup>
				<button>One</button>
				<button>Two</button>
			</ButtonGroup>,
		)

		expect(screen.getByText('One')).toBeInTheDocument()
		expect(screen.getByText('Two')).toBeInTheDocument()
	})

	it('applies horizontal orientation classes by default without setting data-orientation', () => {
		render(<ButtonGroup data-testid='group' />)
		const group = screen.getByTestId('group')
		expect(group).not.toHaveAttribute('data-orientation')
		expect(group).toHaveClass('flex')
	})

	it('applies the vertical orientation classes and data attribute', () => {
		render(<ButtonGroup data-testid='group' orientation='vertical' />)
		const group = screen.getByTestId('group')
		expect(group).toHaveAttribute('data-orientation', 'vertical')
		expect(group).toHaveClass('flex-col')
	})

	it('merges a custom className with the variant classes', () => {
		render(<ButtonGroup data-testid='group' className='ml-auto' />)
		expect(screen.getByTestId('group')).toHaveClass('ml-auto', 'flex')
	})
})

describe('ButtonGroupText', () => {
	it('renders as a div by default', () => {
		render(<ButtonGroupText>Label</ButtonGroupText>)
		const el = screen.getByText('Label')
		expect(el.tagName).toBe('DIV')
		expect(el).toHaveClass('flex', 'items-center', 'rounded-md', 'border')
	})

	it('renders as the child element when asChild is set', () => {
		render(
			<ButtonGroupText asChild>
				<span>Label</span>
			</ButtonGroupText>,
		)
		expect(screen.getByText('Label').tagName).toBe('SPAN')
	})

	it('merges a custom className', () => {
		render(<ButtonGroupText className='ml-auto'>Label</ButtonGroupText>)
		expect(screen.getByText('Label')).toHaveClass('ml-auto', 'flex')
	})
})

describe('ButtonGroupSeparator', () => {
	it('renders with the button-group-separator data-slot', () => {
		render(<ButtonGroupSeparator data-testid='separator' />)
		expect(screen.getByTestId('separator')).toHaveAttribute('data-slot', 'button-group-separator')
	})

	it('defaults to vertical orientation', () => {
		render(<ButtonGroupSeparator data-testid='separator' />)
		expect(screen.getByTestId('separator')).toHaveAttribute('data-orientation', 'vertical')
	})

	it('accepts a horizontal orientation', () => {
		render(<ButtonGroupSeparator data-testid='separator' orientation='horizontal' />)
		expect(screen.getByTestId('separator')).toHaveAttribute('data-orientation', 'horizontal')
	})
})
