import { signOut } from 'next-auth/react'

import { useOnboardingContext } from '@households/onboarding/context/onboarding.context'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OnboardingHouseholdPage } from './onboarding-page'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('next-auth/react', () => ({
	signOut: vi.fn(),
}))

function ViewSwitcherStub({ label }: { label: string }) {
	const { view, setView } = useOnboardingContext()
	return (
		<div data-testid={`onboarding-${view}`}>
			<button onClick={() => setView(view === 'create' ? 'join' : 'create')}>{label}</button>
		</div>
	)
}

vi.mock('@households/onboarding/components/onboarding-create', () => ({
	OnboardingCreate: () => <ViewSwitcherStub label='switch-to-join' />,
}))

vi.mock('@households/onboarding/components/onboarding-join', () => ({
	OnboardingJoin: () => <ViewSwitcherStub label='switch-to-create' />,
}))

vi.mock('@households/onboarding/components/onboarding-header', () => ({
	OnboardingHeader: ({ view }: { view: string }) => <h1>{view}</h1>,
}))

vi.mock('@households/onboarding/components/onboarding-create-note', () => ({
	OnboardingCreateNote: () => <div data-testid='onboarding-create-note' />,
}))

describe('OnboardingHouseholdPage', () => {
	it('renders the create view by default', () => {
		render(<OnboardingHouseholdPage />)
		expect(screen.getByTestId('onboarding-create')).toBeInTheDocument()
		expect(screen.getByRole('heading', { name: 'create' })).toBeInTheDocument()
	})

	it('renders the create note only in the create view', () => {
		render(<OnboardingHouseholdPage />)
		expect(screen.getByTestId('onboarding-create-note')).toBeInTheDocument()
	})

	it('switches to the join view and hides the create note', async () => {
		const user = userEvent.setup()
		render(<OnboardingHouseholdPage />)

		await user.click(screen.getByText('switch-to-join'))

		expect(screen.getByTestId('onboarding-join')).toBeInTheDocument()
		expect(screen.getByRole('heading', { name: 'join' })).toBeInTheDocument()
		expect(screen.queryByTestId('onboarding-create-note')).not.toBeInTheDocument()
	})

	it('signs out with the sign-in callback url when the sign-out button is clicked', async () => {
		const user = userEvent.setup()
		render(<OnboardingHouseholdPage />)

		await user.click(screen.getByRole('button', { name: 'sign-out' }))

		expect(signOut).toHaveBeenCalledWith({ callbackUrl: '/signin' })
	})
})
