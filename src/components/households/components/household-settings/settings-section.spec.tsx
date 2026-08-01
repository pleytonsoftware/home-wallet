import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SettingsSection } from './settings-section'

beforeAll(() => {
	globalThis.ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
})

describe('SettingsSection', () => {
	it('renders the title inside a level 3 heading', () => {
		render(<SettingsSection title='General' />)
		expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('General')
	})

	it('renders the description when provided', () => {
		render(<SettingsSection title='General' description='Basic settings' />)
		expect(screen.getByText('Basic settings')).toBeInTheDocument()
	})

	it('does not render a description paragraph when omitted', () => {
		const { container } = render(<SettingsSection title='General' />)
		expect(container.querySelector('p')).not.toBeInTheDocument()
	})

	it('renders the header action', () => {
		render(<SettingsSection title='General' headerAction={<button>Help</button>} />)
		expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument()
	})

	it('renders children', () => {
		render(
			<SettingsSection title='General'>
				<span>Body content</span>
			</SettingsSection>,
		)
		expect(screen.getByText('Body content')).toBeInTheDocument()
	})

	it('does not render the children wrapper when no children are given', () => {
		const { container } = render(<SettingsSection title='General' />)
		// only header remains inside the section; no extra content wrapper divs
		expect(container.querySelector('section > div')).not.toBeInTheDocument()
	})

	it('renders the footer inside a footer element when provided', () => {
		const { container } = render(<SettingsSection title='General' footer={<button>Save</button>} />)
		const footer = container.querySelector('footer')
		expect(footer).toBeInTheDocument()
		expect(footer).toContainElement(screen.getByRole('button', { name: 'Save' }))
	})

	it('does not render a footer element when omitted', () => {
		const { container } = render(<SettingsSection title='General' />)
		expect(container.querySelector('footer')).not.toBeInTheDocument()
	})

	it('applies a custom className to the section', () => {
		const { container } = render(<SettingsSection title='General' className='custom-section' />)
		expect(container.querySelector('section')).toHaveClass('custom-section')
	})

	describe('help', () => {
		it('does not render a help trigger when omitted', () => {
			render(<SettingsSection title='General' />)
			expect(screen.queryByRole('button', { name: 'transfer-list-help' })).not.toBeInTheDocument()
		})

		it('renders a help trigger next to the title when provided', () => {
			render(<SettingsSection title='General' help='Help content' />)
			expect(screen.getByRole('button', { name: 'transfer-list-help' })).toBeInTheDocument()
		})

		it('keeps the help content hidden until the trigger is clicked', () => {
			render(<SettingsSection title='General' help='Help content' />)
			expect(screen.queryByText('Help content')).not.toBeInTheDocument()
		})

		it('shows the help content when the trigger is clicked', async () => {
			const user = userEvent.setup()
			render(<SettingsSection title='General' help='Help content' />)

			await user.click(screen.getByRole('button', { name: 'transfer-list-help' }))

			expect(screen.getByText('Help content')).toBeInTheDocument()
		})

		it('renders the help trigger inside the title heading', () => {
			render(<SettingsSection title='General' help='Help content' />)
			expect(screen.getByRole('heading', { level: 3 })).toContainElement(
				screen.getByRole('button', { name: 'transfer-list-help' }),
			)
		})
	})
})
