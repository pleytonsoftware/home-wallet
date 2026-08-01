import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { HelpPopover } from './help-popover'

beforeAll(() => {
	globalThis.ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
})

describe('HelpPopover', () => {
	it('renders a trigger button with the expected aria-label', () => {
		render(<HelpPopover>Help content</HelpPopover>)
		expect(screen.getByRole('button', { name: 'transfer-list-help' })).toBeInTheDocument()
	})

	it('keeps the content hidden until the trigger is clicked', () => {
		render(<HelpPopover>Help content</HelpPopover>)
		expect(screen.queryByText('Help content')).not.toBeInTheDocument()
	})

	it('shows the children content when the trigger is clicked', async () => {
		const user = userEvent.setup()
		render(<HelpPopover>Help content</HelpPopover>)

		await user.click(screen.getByRole('button', { name: 'transfer-list-help' }))

		expect(screen.getByText('Help content')).toBeInTheDocument()
	})

	it('renders arbitrary children, not just text', async () => {
		const user = userEvent.setup()
		render(
			<HelpPopover>
				<p>Title</p>
				<p>Body</p>
			</HelpPopover>,
		)

		await user.click(screen.getByRole('button', { name: 'transfer-list-help' }))

		expect(screen.getByText('Title')).toBeInTheDocument()
		expect(screen.getByText('Body')).toBeInTheDocument()
	})

	it('closes the content when the trigger is clicked again', async () => {
		const user = userEvent.setup()
		render(<HelpPopover>Help content</HelpPopover>)

		const trigger = screen.getByRole('button', { name: 'transfer-list-help' })
		await user.click(trigger)
		expect(screen.getByText('Help content')).toBeInTheDocument()

		await user.click(trigger)
		expect(screen.queryByText('Help content')).not.toBeInTheDocument()
	})
})
