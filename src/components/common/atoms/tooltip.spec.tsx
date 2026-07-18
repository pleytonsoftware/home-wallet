import { render, screen } from '@testing-library/react'

import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip'

beforeAll(() => {
	globalThis.ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
})

describe('TooltipProvider', () => {
	it('renders children', () => {
		render(
			<TooltipProvider>
				<div data-testid='child'>Content</div>
			</TooltipProvider>,
		)
		expect(screen.getByTestId('child')).toBeInTheDocument()
	})

	it('does not add extra DOM wrapper', () => {
		const { container } = render(
			<TooltipProvider>
				<div data-testid='child'>Content</div>
			</TooltipProvider>,
		)
		expect(container.children.length).toBe(1)
		expect(container.firstChild).toBe(screen.getByTestId('child'))
	})
})

describe('Tooltip', () => {
	it('renders children without adding DOM element', () => {
		render(
			<TooltipProvider>
				<Tooltip>
					<button data-testid='trigger'>Trigger</button>
				</Tooltip>
			</TooltipProvider>,
		)
		expect(screen.getByTestId('trigger')).toBeInTheDocument()
	})
})

describe('TooltipTrigger', () => {
	it('renders as a button with data-slot', () => {
		render(
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger data-testid='trigger'>Hover</TooltipTrigger>
					<TooltipContent>Tip</TooltipContent>
				</Tooltip>
			</TooltipProvider>,
		)
		const trigger = screen.getByTestId('trigger')
		expect(trigger).toHaveAttribute('data-slot', 'tooltip-trigger')
		expect(trigger.tagName).toBe('BUTTON')
	})

	it('has data-state attribute', () => {
		render(
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger data-testid='trigger'>Hover</TooltipTrigger>
					<TooltipContent>Tip</TooltipContent>
				</Tooltip>
			</TooltipProvider>,
		)
		expect(screen.getByTestId('trigger')).toHaveAttribute('data-state')
	})

	it('renders children', () => {
		render(
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger data-testid='trigger'>
						<span>Icon</span>
					</TooltipTrigger>
					<TooltipContent>Tip</TooltipContent>
				</Tooltip>
			</TooltipProvider>,
		)
		expect(screen.getByText('Icon')).toBeInTheDocument()
	})

	it('accepts custom className', () => {
		render(
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger className='custom-trigger' data-testid='trigger'>
						Hover
					</TooltipTrigger>
					<TooltipContent>Tip</TooltipContent>
				</Tooltip>
			</TooltipProvider>,
		)
		expect(screen.getByTestId('trigger')).toHaveClass('custom-trigger')
	})
})

describe('TooltipContent', () => {
	it('does not render in DOM when tooltip is closed', () => {
		render(
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger>Hover</TooltipTrigger>
					<TooltipContent>Tip text</TooltipContent>
				</Tooltip>
			</TooltipProvider>,
		)
		expect(screen.queryByText('Tip text')).not.toBeInTheDocument()
	})

	it('renders children when forced open via defaultOpen', () => {
		render(
			<TooltipProvider>
				<Tooltip defaultOpen>
					<TooltipTrigger>Hover</TooltipTrigger>
					<TooltipContent data-testid='content'>Tip text</TooltipContent>
				</Tooltip>
			</TooltipProvider>,
		)
		expect(screen.getByTestId('content')).toBeInTheDocument()
		expect(screen.getByTestId('content')).toHaveTextContent('Tip text')
	})

	it('applies custom className when open', () => {
		render(
			<TooltipProvider>
				<Tooltip defaultOpen>
					<TooltipTrigger>Hover</TooltipTrigger>
					<TooltipContent className='custom-tooltip' data-testid='content'>
						Tip
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>,
		)
		expect(screen.getByTestId('content')).toHaveClass('custom-tooltip')
	})

	it('renders with data-slot when open', () => {
		render(
			<TooltipProvider>
				<Tooltip defaultOpen>
					<TooltipTrigger>Hover</TooltipTrigger>
					<TooltipContent data-testid='content'>Tip</TooltipContent>
				</Tooltip>
			</TooltipProvider>,
		)
		expect(screen.getByTestId('content')).toHaveAttribute('data-slot', 'tooltip-content')
	})

	it('applies default classes when open', () => {
		render(
			<TooltipProvider>
				<Tooltip defaultOpen>
					<TooltipTrigger>Hover</TooltipTrigger>
					<TooltipContent data-testid='content'>Tip</TooltipContent>
				</Tooltip>
			</TooltipProvider>,
		)
		const el = screen.getByTestId('content')
		expect(el).toHaveClass('rounded-md', 'bg-foreground', 'text-xs', 'text-background')
	})
})

describe('Tooltip composition', () => {
	it('renders full tooltip structure', () => {
		render(
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger data-testid='trigger'>?</TooltipTrigger>
					<TooltipContent data-testid='content'>Help text</TooltipContent>
				</Tooltip>
			</TooltipProvider>,
		)
		expect(screen.getByTestId('trigger')).toBeInTheDocument()
		expect(screen.getByText('?')).toBeInTheDocument()
	})

	it('renders multiple tooltips', () => {
		render(
			<TooltipProvider>
				<Tooltip>
					<TooltipTrigger data-testid='trigger1'>1</TooltipTrigger>
					<TooltipContent>Tip 1</TooltipContent>
				</Tooltip>
				<Tooltip>
					<TooltipTrigger data-testid='trigger2'>2</TooltipTrigger>
					<TooltipContent>Tip 2</TooltipContent>
				</Tooltip>
			</TooltipProvider>,
		)
		expect(screen.getByTestId('trigger1')).toBeInTheDocument()
		expect(screen.getByTestId('trigger2')).toBeInTheDocument()
	})
})
