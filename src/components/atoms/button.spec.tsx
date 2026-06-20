import { render, screen } from '@testing-library/react'

import { Button, buttonVariants } from './button'

describe('Button component', () => {
	it('renders children correctly', () => {
		render(<Button>Click me</Button>)
		expect(screen.getByText('Click me')).toBeInTheDocument()
	})

	it('renders with default variant', () => {
		render(<Button>Default</Button>)
		const button = screen.getByRole('button')
		expect(button).toHaveAttribute('data-variant', 'default')
		expect(button).toHaveAttribute('data-size', 'default')
	})

	it('renders with custom variant', () => {
		render(<Button variant='outline'>Outline</Button>)
		expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'outline')
	})

	it('renders with custom size', () => {
		render(<Button size='sm'>Small</Button>)
		expect(screen.getByRole('button')).toHaveAttribute('data-size', 'sm')
	})

	it('renders with custom shape', () => {
		render(<Button shape='block'>Block</Button>)
		expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'default')
	})

	it('applies custom className', () => {
		render(<Button className='custom-class'>Styled</Button>)
		const button = screen.getByRole('button')
		expect(button).toHaveClass('custom-class')
	})

	it('passes through native button props', () => {
		render(<Button disabled>Disabled</Button>)
		expect(screen.getByRole('button')).toBeDisabled()
	})

	it('renders with role prop', () => {
		render(<Button role='menuitem'>Menu Item</Button>)
		expect(screen.getByRole('menuitem')).toBeInTheDocument()
	})

	it('renders icon when provided', () => {
		render(<Button icon={<span data-testid='icon'>Icon</span>}>With Icon</Button>)
		expect(screen.getByTestId('icon')).toBeInTheDocument()
		expect(screen.getByText('With Icon')).toBeInTheDocument()
	})

	it('shows loading spinner instead of icon', () => {
		render(
			<Button loading icon={<span data-testid='icon'>Icon</span>}>
				Loading
			</Button>,
		)
		expect(screen.queryByTestId('icon')).not.toBeInTheDocument()
		expect(screen.getByText('Loading')).toBeInTheDocument()
		expect(screen.getByRole('status')).toBeInTheDocument()
	})

	it('shows loading spinner without children', () => {
		render(<Button loading />)
		expect(screen.getByRole('status')).toBeInTheDocument()
	})

	it('forwards ref correctly', () => {
		const ref = { current: null }
		render(<Button ref={ref}>Ref</Button>)
		expect(ref.current).toBeInstanceOf(HTMLButtonElement)
	})

	it('renders as custom element with as prop', () => {
		render(
			<Button as='a' href='/custom'>
				Custom Element
			</Button>,
		)
		const link = screen.getByRole('link')
		expect(link).toHaveAttribute('href', '/custom')
	})

	it('sets data-slot attribute', () => {
		render(<Button>Slot</Button>)
		expect(screen.getByRole('button')).toHaveAttribute('data-slot', 'button')
	})

	it('handles click events', () => {
		const handleClick = vi.fn()
		render(<Button onClick={handleClick}>Click</Button>)
		screen.getByRole('button').click()
		expect(handleClick).toHaveBeenCalledTimes(1)
	})
})

describe('buttonVariants', () => {
	it('generates correct classes for default variant', () => {
		const classes = buttonVariants({ variant: 'default' })
		expect(classes).toContain('bg-primary')
		expect(classes).toContain('text-primary-foreground')
	})

	it('generates correct classes for outline variant', () => {
		const classes = buttonVariants({ variant: 'outline' })
		expect(classes).toContain('border-border')
		expect(classes).toContain('bg-background')
	})

	it('generates correct classes for secondary variant', () => {
		const classes = buttonVariants({ variant: 'secondary' })
		expect(classes).toContain('bg-secondary')
		expect(classes).toContain('text-secondary-foreground')
	})

	it('generates correct classes for ghost variant', () => {
		const classes = buttonVariants({ variant: 'ghost' })
		expect(classes).toContain('hover:bg-muted')
	})

	it('generates correct classes for destructive variant', () => {
		const classes = buttonVariants({ variant: 'destructive' })
		expect(classes).toContain('text-destructive')
	})

	it('generates correct classes for link variant', () => {
		const classes = buttonVariants({ variant: 'link' })
		expect(classes).toContain('text-primary')
		expect(classes).toContain('underline-offset-4')
	})

	it('generates correct classes for size default', () => {
		const classes = buttonVariants({ size: 'default' })
		expect(classes).toContain('h-9')
	})

	it('generates correct classes for size xs', () => {
		const classes = buttonVariants({ size: 'xs' })
		expect(classes).toContain('h-6')
	})

	it('generates correct classes for size sm', () => {
		const classes = buttonVariants({ size: 'sm' })
		expect(classes).toContain('h-8')
	})

	it('generates correct classes for size lg', () => {
		const classes = buttonVariants({ size: 'lg' })
		expect(classes).toContain('h-10')
	})

	it('generates correct classes for shape block', () => {
		const classes = buttonVariants({ shape: 'block' })
		expect(classes).toContain('w-full')
	})

	it('generates correct classes for shape circle', () => {
		const classes = buttonVariants({ shape: 'circle' })
		expect(classes).toContain('rounded-full')
	})

	it('merges custom className with variant classes', () => {
		const classes = buttonVariants({ variant: 'default', className: 'extra-class' })
		expect(classes).toContain('extra-class')
		expect(classes).toContain('bg-primary')
	})
})
