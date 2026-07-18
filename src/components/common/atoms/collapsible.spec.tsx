import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'

describe('Collapsible', () => {
	it('renders with data-slot attribute', () => {
		render(<Collapsible data-testid='collapsible' />)
		expect(screen.getByTestId('collapsible')).toHaveAttribute('data-slot', 'collapsible')
	})

	it('renders with defaultOpen prop', () => {
		render(
			<Collapsible defaultOpen data-testid='collapsible'>
				<CollapsibleTrigger>Toggle</CollapsibleTrigger>
				<CollapsibleContent>Content</CollapsibleContent>
			</Collapsible>,
		)
		expect(screen.getByTestId('collapsible')).toHaveAttribute('data-state', 'open')
	})

	it('renders with disabled prop', () => {
		render(
			<Collapsible disabled data-testid='collapsible'>
				<CollapsibleTrigger>Toggle</CollapsibleTrigger>
				<CollapsibleContent>Content</CollapsibleContent>
			</Collapsible>,
		)
		expect(screen.getByTestId('collapsible')).toHaveAttribute('data-disabled')
	})
})

describe('CollapsibleTrigger', () => {
	it('renders with data-slot attribute', () => {
		render(
			<Collapsible>
				<CollapsibleTrigger data-testid='trigger'>Toggle</CollapsibleTrigger>
			</Collapsible>,
		)
		expect(screen.getByTestId('trigger')).toHaveAttribute('data-slot', 'collapsible-trigger')
	})

	it('renders children', () => {
		render(
			<Collapsible>
				<CollapsibleTrigger>Open Menu</CollapsibleTrigger>
			</Collapsible>,
		)
		expect(screen.getByText('Open Menu')).toBeInTheDocument()
	})

	it('toggles collapsible state on click', async () => {
		const user = userEvent.setup()
		render(
			<Collapsible data-testid='collapsible'>
				<CollapsibleTrigger data-testid='trigger'>Toggle</CollapsibleTrigger>
				<CollapsibleContent data-testid='content'>Content</CollapsibleContent>
			</Collapsible>,
		)

		const trigger = screen.getByTestId('trigger')
		expect(screen.getByTestId('collapsible')).toHaveAttribute('data-state', 'closed')

		await user.click(trigger)
		expect(screen.getByTestId('collapsible')).toHaveAttribute('data-state', 'open')

		await user.click(trigger)
		expect(screen.getByTestId('collapsible')).toHaveAttribute('data-state', 'closed')
	})

	it('has button role', () => {
		render(
			<Collapsible>
				<CollapsibleTrigger data-testid='trigger'>Toggle</CollapsibleTrigger>
			</Collapsible>,
		)
		expect(screen.getByTestId('trigger')).toHaveAttribute('type', 'button')
	})
})

describe('CollapsibleContent', () => {
	it('renders with data-slot attribute', () => {
		render(
			<Collapsible>
				<CollapsibleContent data-testid='content'>Hidden content</CollapsibleContent>
			</Collapsible>,
		)
		expect(screen.getByTestId('content')).toHaveAttribute('data-slot', 'collapsible-content')
	})

	it('renders children', () => {
		render(
			<Collapsible defaultOpen>
				<CollapsibleContent>Content here</CollapsibleContent>
			</Collapsible>,
		)
		expect(screen.getByText('Content here')).toBeInTheDocument()
	})

	it('shows content when collapsible is open', async () => {
		const user = userEvent.setup()
		render(
			<Collapsible>
				<CollapsibleTrigger>Toggle</CollapsibleTrigger>
				<CollapsibleContent data-testid='content'>Visible content</CollapsibleContent>
			</Collapsible>,
		)

		const trigger = screen.getByText('Toggle')
		await user.click(trigger)

		const content = screen.getByTestId('content')
		expect(content).toBeInTheDocument()
	})

	it('accepts custom props', () => {
		render(
			<Collapsible>
				<CollapsibleContent data-testid='content' className='custom-class'>
					Content
				</CollapsibleContent>
			</Collapsible>,
		)
		expect(screen.getByTestId('content')).toHaveClass('custom-class')
	})
})

describe('Collapsible integration', () => {
	it('renders complete collapsible structure', () => {
		render(
			<Collapsible data-testid='collapsible'>
				<CollapsibleTrigger data-testid='trigger'>Toggle</CollapsibleTrigger>
				<CollapsibleContent data-testid='content'>Content</CollapsibleContent>
			</Collapsible>,
		)

		expect(screen.getByTestId('collapsible')).toHaveAttribute('data-slot', 'collapsible')
		expect(screen.getByTestId('trigger')).toHaveAttribute('data-slot', 'collapsible-trigger')
		expect(screen.getByTestId('content')).toHaveAttribute('data-slot', 'collapsible-content')
	})

	it('manages state across trigger and content', async () => {
		const user = userEvent.setup()
		render(
			<Collapsible data-testid='collapsible'>
				<CollapsibleTrigger data-testid='trigger'>Toggle</CollapsibleTrigger>
				<CollapsibleContent data-testid='content'>Content</CollapsibleContent>
			</Collapsible>,
		)

		expect(screen.getByTestId('trigger')).toHaveAttribute('data-state', 'closed')
		await user.click(screen.getByTestId('trigger'))
		expect(screen.getByTestId('trigger')).toHaveAttribute('data-state', 'open')
	})
})
