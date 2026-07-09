import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription } from './sheet'

describe('Sheet', () => {
	it('opens and closes sheet via trigger', async () => {
		const user = userEvent.setup()
		render(
			<Sheet>
				<SheetTrigger data-testid='trigger'>Open</SheetTrigger>
				<SheetContent>Sheet Body</SheetContent>
			</Sheet>,
		)

		expect(screen.queryByText('Sheet Body')).not.toBeInTheDocument()

		await user.click(screen.getByTestId('trigger'))
		expect(screen.getByText('Sheet Body')).toBeInTheDocument()

		await user.click(screen.getByRole('button', { name: /close/i }))
		expect(screen.queryByText('Sheet Body')).not.toBeInTheDocument()
	})

	it('renders SheetTrigger with data-slot', () => {
		render(
			<Sheet>
				<SheetTrigger data-testid='trigger'>Open</SheetTrigger>
			</Sheet>,
		)
		expect(screen.getByTestId('trigger')).toHaveAttribute('data-slot', 'sheet-trigger')
	})
})

describe('SheetContent', () => {
	it('renders content with data-slot and default side', async () => {
		const user = userEvent.setup()
		render(
			<Sheet>
				<SheetTrigger>Open</SheetTrigger>
				<SheetContent>Body</SheetContent>
			</Sheet>,
		)

		await user.click(screen.getByText('Open'))
		const content = document.querySelector('[data-slot="sheet-content"]')
		expect(content).toBeInTheDocument()
		expect(content).toHaveAttribute('data-side', 'right')
	})

	it('renders with left side', async () => {
		const user = userEvent.setup()
		render(
			<Sheet>
				<SheetTrigger>Open</SheetTrigger>
				<SheetContent side='left'>Body</SheetContent>
			</Sheet>,
		)

		await user.click(screen.getByText('Open'))
		const content = document.querySelector('[data-slot="sheet-content"]')
		expect(content).toHaveAttribute('data-side', 'left')
	})

	it('renders with top side', async () => {
		const user = userEvent.setup()
		render(
			<Sheet>
				<SheetTrigger>Open</SheetTrigger>
				<SheetContent side='top'>Body</SheetContent>
			</Sheet>,
		)

		await user.click(screen.getByText('Open'))
		const content = document.querySelector('[data-slot="sheet-content"]')
		expect(content).toHaveAttribute('data-side', 'top')
	})

	it('renders with bottom side', async () => {
		const user = userEvent.setup()
		render(
			<Sheet>
				<SheetTrigger>Open</SheetTrigger>
				<SheetContent side='bottom'>Body</SheetContent>
			</Sheet>,
		)

		await user.click(screen.getByText('Open'))
		const content = document.querySelector('[data-slot="sheet-content"]')
		expect(content).toHaveAttribute('data-side', 'bottom')
	})

	it('shows close button by default', async () => {
		const user = userEvent.setup()
		render(
			<Sheet>
				<SheetTrigger>Open</SheetTrigger>
				<SheetContent>Body</SheetContent>
			</Sheet>,
		)

		await user.click(screen.getByText('Open'))
		expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument()
	})

	it('hides close button when showCloseButton is false', async () => {
		const user = userEvent.setup()
		render(
			<Sheet>
				<SheetTrigger>Open</SheetTrigger>
				<SheetContent showCloseButton={false}>Body</SheetContent>
			</Sheet>,
		)

		await user.click(screen.getByText('Open'))
		expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument()
	})

	it('accepts custom className', async () => {
		const user = userEvent.setup()
		render(
			<Sheet>
				<SheetTrigger>Open</SheetTrigger>
				<SheetContent className='custom-class'>Body</SheetContent>
			</Sheet>,
		)

		await user.click(screen.getByText('Open'))
		const content = document.querySelector('[data-slot="sheet-content"]')
		expect(content).toHaveClass('custom-class')
	})
})

describe('SheetOverlay', () => {
	it('renders overlay with data-slot when sheet is open', async () => {
		const user = userEvent.setup()
		render(
			<Sheet>
				<SheetTrigger>Open</SheetTrigger>
				<SheetContent>Body</SheetContent>
			</Sheet>,
		)

		await user.click(screen.getByText('Open'))
		const overlay = document.querySelector('[data-slot="sheet-overlay"]')
		expect(overlay).toBeInTheDocument()
	})
})

describe('SheetHeader', () => {
	it('renders header with data-slot', async () => {
		const user = userEvent.setup()
		render(
			<Sheet>
				<SheetTrigger>Open</SheetTrigger>
				<SheetContent>
					<SheetHeader>Header</SheetHeader>
				</SheetContent>
			</Sheet>,
		)

		await user.click(screen.getByText('Open'))
		const header = document.querySelector('[data-slot="sheet-header"]')
		expect(header).toBeInTheDocument()
		expect(header).toHaveTextContent('Header')
	})

	it('accepts custom className', async () => {
		const user = userEvent.setup()
		render(
			<Sheet>
				<SheetTrigger>Open</SheetTrigger>
				<SheetContent>
					<SheetHeader className='custom-header'>Header</SheetHeader>
				</SheetContent>
			</Sheet>,
		)

		await user.click(screen.getByText('Open'))
		const header = document.querySelector('[data-slot="sheet-header"]')
		expect(header).toHaveClass('custom-header')
	})
})

describe('SheetFooter', () => {
	it('renders footer with data-slot', async () => {
		const user = userEvent.setup()
		render(
			<Sheet>
				<SheetTrigger>Open</SheetTrigger>
				<SheetContent>
					<SheetFooter>Footer</SheetFooter>
				</SheetContent>
			</Sheet>,
		)

		await user.click(screen.getByText('Open'))
		const footer = document.querySelector('[data-slot="sheet-footer"]')
		expect(footer).toBeInTheDocument()
		expect(footer).toHaveTextContent('Footer')
	})

	it('accepts custom className', async () => {
		const user = userEvent.setup()
		render(
			<Sheet>
				<SheetTrigger>Open</SheetTrigger>
				<SheetContent>
					<SheetFooter className='custom-footer'>Footer</SheetFooter>
				</SheetContent>
			</Sheet>,
		)

		await user.click(screen.getByText('Open'))
		const footer = document.querySelector('[data-slot="sheet-footer"]')
		expect(footer).toHaveClass('custom-footer')
	})
})

describe('SheetTitle', () => {
	it('renders title with data-slot', async () => {
		const user = userEvent.setup()
		render(
			<Sheet>
				<SheetTrigger>Open</SheetTrigger>
				<SheetContent>
					<SheetTitle>Title</SheetTitle>
				</SheetContent>
			</Sheet>,
		)

		await user.click(screen.getByText('Open'))
		const title = document.querySelector('[data-slot="sheet-title"]')
		expect(title).toBeInTheDocument()
		expect(title).toHaveTextContent('Title')
	})

	it('accepts custom className', async () => {
		const user = userEvent.setup()
		render(
			<Sheet>
				<SheetTrigger>Open</SheetTrigger>
				<SheetContent>
					<SheetTitle className='custom-title'>Title</SheetTitle>
				</SheetContent>
			</Sheet>,
		)

		await user.click(screen.getByText('Open'))
		const title = document.querySelector('[data-slot="sheet-title"]')
		expect(title).toHaveClass('custom-title')
	})
})

describe('SheetDescription', () => {
	it('renders description with data-slot', async () => {
		const user = userEvent.setup()
		render(
			<Sheet>
				<SheetTrigger>Open</SheetTrigger>
				<SheetContent>
					<SheetDescription>Description</SheetDescription>
				</SheetContent>
			</Sheet>,
		)

		await user.click(screen.getByText('Open'))
		const description = document.querySelector('[data-slot="sheet-description"]')
		expect(description).toBeInTheDocument()
		expect(description).toHaveTextContent('Description')
	})

	it('accepts custom className', async () => {
		const user = userEvent.setup()
		render(
			<Sheet>
				<SheetTrigger>Open</SheetTrigger>
				<SheetContent>
					<SheetDescription className='custom-desc'>Description</SheetDescription>
				</SheetContent>
			</Sheet>,
		)

		await user.click(screen.getByText('Open'))
		const description = document.querySelector('[data-slot="sheet-description"]')
		expect(description).toHaveClass('custom-desc')
	})
})

describe('SheetClose', () => {
	it('closes sheet when clicked', async () => {
		const user = userEvent.setup()
		render(
			<Sheet>
				<SheetTrigger>Open</SheetTrigger>
				<SheetContent>
					<p>Body</p>
					<SheetClose data-testid='close-btn'>Close</SheetClose>
				</SheetContent>
			</Sheet>,
		)

		await user.click(screen.getByText('Open'))
		expect(screen.getByText('Body')).toBeInTheDocument()

		await user.click(screen.getByTestId('close-btn'))
		expect(screen.queryByText('Body')).not.toBeInTheDocument()
	})
})
