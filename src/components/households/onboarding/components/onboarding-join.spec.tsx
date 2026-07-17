import { useRouter } from 'next/navigation'

import { joinHousehold } from '@actions/household/join'
import { OnboardingProvider } from '@households/onboarding/context/onboarding.context'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OnboardingJoin } from './onboarding-join'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('next/navigation', () => ({
	useRouter: vi.fn(),
}))

vi.mock('@actions/household/join', () => ({
	joinHousehold: vi.fn(),
}))

const push = vi.fn()

function renderJoin() {
	return render(
		<OnboardingProvider value={{ view: 'join', setView: vi.fn() }}>
			<OnboardingJoin />
		</OnboardingProvider>,
	)
}

describe('OnboardingJoin', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(useRouter).mockReturnValue({ push } as unknown as ReturnType<typeof useRouter>)
	})

	it('renders the invite code field and submit button', () => {
		renderJoin()
		expect(screen.getByPlaceholderText('invite-code.placeholder')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'submit-button' })).toBeInTheDocument()
	})

	it('joins the household and navigates on success', async () => {
		vi.mocked(joinHousehold).mockResolvedValue({ success: true, data: { id: 'household-1' } } as Awaited<ReturnType<typeof joinHousehold>>)
		const user = userEvent.setup()
		renderJoin()

		await user.type(screen.getByPlaceholderText('invite-code.placeholder'), 'abc123')
		await user.click(screen.getByRole('button', { name: 'submit-button' }))

		await waitFor(() => expect(joinHousehold).toHaveBeenCalledWith('ABC123'))
		await waitFor(() => expect(push).toHaveBeenCalledWith('/households'))
	})

	it('shows a root error and does not navigate on a generic failure', async () => {
		vi.mocked(joinHousehold).mockResolvedValue({ success: false, error: 'Invalid code' } as Awaited<ReturnType<typeof joinHousehold>>)
		const user = userEvent.setup()
		renderJoin()

		await user.type(screen.getByPlaceholderText('invite-code.placeholder'), 'abc123')
		await user.click(screen.getByRole('button', { name: 'submit-button' }))

		expect(await screen.findByText('Invalid code')).toBeInTheDocument()
		expect(push).not.toHaveBeenCalled()
	})

	it('maps field-level validation errors from the server response', async () => {
		vi.mocked(joinHousehold).mockResolvedValue({
			success: false,
			error: [{ path: ['code'], code: 'custom', message: 'Code not found' }],
		} as unknown as Awaited<ReturnType<typeof joinHousehold>>)
		const user = userEvent.setup()
		renderJoin()

		await user.type(screen.getByPlaceholderText('invite-code.placeholder'), 'abc123')
		await user.click(screen.getByRole('button', { name: 'submit-button' }))

		await waitFor(() => expect(screen.getAllByText('Code not found').length).toBeGreaterThan(0))
	})
})
