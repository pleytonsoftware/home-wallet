import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { HouseholdCreate } from './household-create'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('./household-create-form', () => ({
	HouseholdCreateForm: () => <div data-testid='household-create-form' />,
}))

describe('HouseholdCreate', () => {
	it('renders the trigger', () => {
		render(<HouseholdCreate trigger={<button>Open</button>} />)
		expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument()
	})

	it('does not render the sheet content before opening', () => {
		render(<HouseholdCreate trigger={<button>Open</button>} />)
		expect(screen.queryByText('title')).not.toBeInTheDocument()
	})

	it('opens the sheet with title, description, and the form when the trigger is clicked', async () => {
		const user = userEvent.setup()
		render(<HouseholdCreate trigger={<button>Open</button>} />)

		await user.click(screen.getByRole('button', { name: 'Open' }))

		expect(screen.getByText('title')).toBeInTheDocument()
		expect(screen.getByText('description')).toBeInTheDocument()
		expect(screen.getByTestId('household-create-form')).toBeInTheDocument()
	})
})
