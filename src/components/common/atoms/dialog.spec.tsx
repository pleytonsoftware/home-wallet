import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from './dialog'

describe('Dialog', () => {
	it('renders dialog root with data-slot attribute', () => {
		render(
			<Dialog>
				<div data-testid='content'>Hello</div>
			</Dialog>,
		)
		const root = screen.getByTestId('content').closest('[data-slot="dialog"]')
		expect(root).toBeInTheDocument()
	})

	it('opens and closes dialog via trigger', async () => {
		const user = userEvent.setup()
		render(
			<Dialog>
				<DialogTrigger data-testid='trigger'>Open</DialogTrigger>
				<DialogContent>Modal</DialogContent>
			</Dialog>,
		)

		// dialog content should be hidden initially
		expect(screen.queryByText('Modal')).not.toBeInTheDocument()

		await user.click(screen.getByTestId('trigger'))
		expect(screen.getByText('Modal')).toBeInTheDocument()

		// close via Close button inside content
		await user.click(screen.getByRole('button', { name: /close/i }))
		expect(screen.queryByText('Modal')).not.toBeInTheDocument()
	})
})

describe('DialogContent', () => {
	it('renders content and close button when showCloseButton true', async () => {
		const user = userEvent.setup()
		render(
			<Dialog>
				<DialogTrigger>Open</DialogTrigger>
				<DialogContent showCloseButton={true}>Body</DialogContent>
			</Dialog>,
		)

		await user.click(screen.getByText('Open'))
		const closeBtn = screen.getByRole('button', { name: /close/i })
		expect(closeBtn).toBeInTheDocument()

		await user.click(closeBtn)
		expect(screen.queryByText('Body')).not.toBeInTheDocument()
	})

	it('does not render close button when showCloseButton false', async () => {
		const user = userEvent.setup()
		render(
			<Dialog>
				<DialogTrigger>Open</DialogTrigger>
				<DialogContent showCloseButton={false}>Body</DialogContent>
			</Dialog>,
		)

		await user.click(screen.getByText('Open'))
		expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument()
	})
})

describe('DialogHeader & Footer', () => {
	it('renders header and footer slots', async () => {
		const user = userEvent.setup()
		render(
			<Dialog>
				<DialogTrigger>Open</DialogTrigger>
				<DialogContent>
					<DialogHeader data-testid='header'>Header</DialogHeader>
					<div>Body</div>
					<DialogFooter data-testid='footer'>Footer</DialogFooter>
				</DialogContent>
			</Dialog>,
		)

		await user.click(screen.getByText('Open'))
		expect(screen.getByTestId('header')).toHaveTextContent('Header')
		expect(screen.getByTestId('footer')).toHaveTextContent('Footer')
	})
})

describe('DialogOverlay', () => {
	it('renders overlay behind content when dialog open', async () => {
		const user = userEvent.setup()
		render(
			<Dialog>
				<DialogTrigger>Open</DialogTrigger>
				<DialogContent>Body</DialogContent>
			</Dialog>,
		)

		await user.click(screen.getByText('Open'))
		const overlay = screen.getByTestId('dialog-overlay') || document.querySelector('[data-slot="dialog-overlay"]')
		expect(overlay).toBeInTheDocument()
	})
})
