import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogMedia,
	AlertDialogTitle,
	AlertDialogTrigger,
} from './alert-dialog'

const renderDialog = (content?: React.ReactNode) =>
	render(
		<AlertDialog>
			<AlertDialogTrigger>Open</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader data-testid='header'>
					<AlertDialogTitle>Are you sure?</AlertDialogTitle>
					<AlertDialogDescription>This cannot be undone.</AlertDialogDescription>
				</AlertDialogHeader>
				{content}
				<AlertDialogFooter data-testid='footer'>
					<AlertDialogCancel>Cancel</AlertDialogCancel>
					<AlertDialogAction>Confirm</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>,
	)

describe('AlertDialog', () => {
	it('renders root with data-slot attribute', () => {
		render(
			<AlertDialog>
				<AlertDialogTrigger data-testid='trigger'>Open</AlertDialogTrigger>
			</AlertDialog>,
		)
		expect(screen.getByTestId('trigger')).toHaveAttribute('data-slot', 'alert-dialog-trigger')
	})

	it('keeps content hidden until the trigger is clicked', () => {
		renderDialog()
		expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument()
	})

	it('opens the content when the trigger is clicked', async () => {
		const user = userEvent.setup()
		renderDialog()

		await user.click(screen.getByText('Open'))

		expect(screen.getByText('Are you sure?')).toBeInTheDocument()
		expect(screen.getByText('This cannot be undone.')).toBeInTheDocument()
	})

	it('closes the content when the cancel action is clicked', async () => {
		const user = userEvent.setup()
		renderDialog()

		await user.click(screen.getByText('Open'))
		await user.click(screen.getByRole('button', { name: 'Cancel' }))

		expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument()
	})

	it('closes the content when the confirm action is clicked', async () => {
		const user = userEvent.setup()
		renderDialog()

		await user.click(screen.getByText('Open'))
		await user.click(screen.getByRole('button', { name: 'Confirm' }))

		expect(screen.queryByText('Are you sure?')).not.toBeInTheDocument()
	})
})

describe('AlertDialogContent', () => {
	it('renders with data-slot and default size', async () => {
		const user = userEvent.setup()
		renderDialog()

		await user.click(screen.getByText('Open'))
		const content = document.querySelector('[data-slot="alert-dialog-content"]')
		expect(content).toBeInTheDocument()
		expect(content).toHaveAttribute('data-size', 'default')
	})

	it('honors the sm size prop', () => {
		render(
			<AlertDialog defaultOpen>
				<AlertDialogContent size='sm'>
					<AlertDialogTitle>Title</AlertDialogTitle>
				</AlertDialogContent>
			</AlertDialog>,
		)
		expect(document.querySelector('[data-slot="alert-dialog-content"]')).toHaveAttribute('data-size', 'sm')
	})

	it('renders the overlay when open', async () => {
		const user = userEvent.setup()
		renderDialog()

		await user.click(screen.getByText('Open'))
		expect(document.querySelector('[data-slot="alert-dialog-overlay"]')).toBeInTheDocument()
	})
})

describe('AlertDialog structural slots', () => {
	it('renders header, footer, title and description with data-slots', async () => {
		const user = userEvent.setup()
		renderDialog(<AlertDialogMedia data-testid='media'>icon</AlertDialogMedia>)

		await user.click(screen.getByText('Open'))

		expect(screen.getByTestId('header')).toHaveAttribute('data-slot', 'alert-dialog-header')
		expect(screen.getByTestId('footer')).toHaveAttribute('data-slot', 'alert-dialog-footer')
		expect(screen.getByTestId('media')).toHaveAttribute('data-slot', 'alert-dialog-media')
		expect(screen.getByText('Are you sure?')).toHaveAttribute('data-slot', 'alert-dialog-title')
		expect(screen.getByText('This cannot be undone.')).toHaveAttribute('data-slot', 'alert-dialog-description')
	})
})

describe('AlertDialogAction & AlertDialogCancel', () => {
	it('renders action and cancel with their data-slots', async () => {
		const user = userEvent.setup()
		renderDialog()

		await user.click(screen.getByText('Open'))
		expect(screen.getByRole('button', { name: 'Confirm' })).toHaveAttribute('data-slot', 'alert-dialog-action')
		expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute('data-slot', 'alert-dialog-cancel')
	})

	it('applies the given button variants', async () => {
		const user = userEvent.setup()
		render(
			<AlertDialog>
				<AlertDialogTrigger>Open</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogTitle>Title</AlertDialogTitle>
					<AlertDialogFooter>
						<AlertDialogCancel variant='ghost'>Cancel</AlertDialogCancel>
						<AlertDialogAction variant='destructive'>Delete</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>,
		)

		await user.click(screen.getByText('Open'))
		expect(screen.getByRole('button', { name: 'Delete' })).toHaveAttribute('data-variant', 'destructive')
		expect(screen.getByRole('button', { name: 'Cancel' })).toHaveAttribute('data-variant', 'ghost')
	})
})
