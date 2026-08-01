import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

const renderTabs = (props?: { triggerVariant?: 'default' | 'destructive'; listVariant?: 'default' | 'line' }) =>
	render(
		<Tabs defaultValue='one'>
			<TabsList variant={props?.listVariant} data-testid='list'>
				<TabsTrigger value='one' data-testid='trigger-one'>
					One
				</TabsTrigger>
				<TabsTrigger value='two' variant={props?.triggerVariant} data-testid='trigger-two'>
					Two
				</TabsTrigger>
			</TabsList>
			<TabsContent value='one' data-testid='content-one'>
				First content
			</TabsContent>
			<TabsContent value='two' data-testid='content-two'>
				Second content
			</TabsContent>
		</Tabs>,
	)

describe('Tabs', () => {
	it('renders with data-slot attribute', () => {
		render(<Tabs data-testid='tabs' />)
		expect(screen.getByTestId('tabs')).toHaveAttribute('data-slot', 'tabs')
	})

	it('defaults to horizontal orientation', () => {
		render(<Tabs data-testid='tabs' />)
		expect(screen.getByTestId('tabs')).toHaveAttribute('data-orientation', 'horizontal')
	})

	it('honors the orientation prop', () => {
		render(<Tabs orientation='vertical' data-testid='tabs' />)
		expect(screen.getByTestId('tabs')).toHaveAttribute('data-orientation', 'vertical')
	})

	it('merges a custom className', () => {
		render(<Tabs className='custom-tabs' data-testid='tabs' />)
		expect(screen.getByTestId('tabs')).toHaveClass('custom-tabs')
	})
})

describe('TabsList', () => {
	it('renders with data-slot attribute', () => {
		renderTabs()
		expect(screen.getByTestId('list')).toHaveAttribute('data-slot', 'tabs-list')
	})

	it('defaults to the default variant', () => {
		renderTabs()
		expect(screen.getByTestId('list')).toHaveAttribute('data-variant', 'default')
	})

	it('applies the line variant', () => {
		renderTabs({ listVariant: 'line' })
		expect(screen.getByTestId('list')).toHaveAttribute('data-variant', 'line')
	})
})

describe('TabsTrigger', () => {
	it('renders with data-slot attribute', () => {
		renderTabs()
		expect(screen.getByTestId('trigger-one')).toHaveAttribute('data-slot', 'tabs-trigger')
	})

	it('marks the default value trigger as active', () => {
		renderTabs()
		expect(screen.getByTestId('trigger-one')).toHaveAttribute('data-state', 'active')
		expect(screen.getByTestId('trigger-two')).toHaveAttribute('data-state', 'inactive')
	})

	it('does not apply destructive classes for the default variant', () => {
		renderTabs()
		expect(screen.getByTestId('trigger-one')).not.toHaveClass('hover:text-destructive')
	})

	it('applies destructive classes for the destructive variant', () => {
		renderTabs({ triggerVariant: 'destructive' })
		const trigger = screen.getByTestId('trigger-two')
		expect(trigger).toHaveClass('hover:text-destructive')
		expect(trigger).toHaveClass('data-active:text-destructive')
		expect(trigger).toHaveClass('data-active:after:bg-destructive')
	})

	it('merges a custom className alongside variant classes', () => {
		render(
			<Tabs defaultValue='one'>
				<TabsList>
					<TabsTrigger value='one' variant='destructive' className='custom-trigger' data-testid='trigger'>
						One
					</TabsTrigger>
				</TabsList>
			</Tabs>,
		)
		const trigger = screen.getByTestId('trigger')
		expect(trigger).toHaveClass('custom-trigger')
		expect(trigger).toHaveClass('hover:text-destructive')
	})
})

describe('TabsContent', () => {
	it('renders with data-slot attribute', () => {
		renderTabs()
		expect(screen.getByTestId('content-one')).toHaveAttribute('data-slot', 'tabs-content')
	})

	it('shows the active content and hides the inactive one', () => {
		renderTabs()
		expect(screen.getByText('First content')).toBeInTheDocument()
		expect(screen.queryByText('Second content')).not.toBeInTheDocument()
	})

	it('switches content when another trigger is clicked', async () => {
		const user = userEvent.setup()
		renderTabs()

		await user.click(screen.getByTestId('trigger-two'))

		expect(screen.getByText('Second content')).toBeInTheDocument()
		expect(screen.queryByText('First content')).not.toBeInTheDocument()
		expect(screen.getByTestId('trigger-two')).toHaveAttribute('data-state', 'active')
	})
})
