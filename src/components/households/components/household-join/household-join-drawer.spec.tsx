import type { PropsWithChildren } from 'react'

import { useRouter } from 'next/navigation'

import { joinHousehold } from '@actions/household/join'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { HouseholdJoinDrawer } from './household-join-drawer'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('next/navigation', () => ({
	useRouter: vi.fn(),
}))

vi.mock('@actions/household/join', () => ({
	joinHousehold: vi.fn(),
}))

vi.mock('@lib/logger', () => ({
	logger: { error: vi.fn() },
}))

// Vaul (the real Drawer's drag engine) relies on pointer-capture/gesture APIs jsdom doesn't implement,
// which throws when userEvent dispatches pointer events over drawer content. Stub with simple
// always-rendered stand-ins so this test can focus on HouseholdJoinDrawer's own logic.
vi.mock('@atoms/drawer', () => ({
	Drawer: ({ children }: PropsWithChildren) => <>{children}</>,
	DrawerTrigger: ({ children }: PropsWithChildren) => <>{children}</>,
	DrawerContent: ({ children }: PropsWithChildren) => <div>{children}</div>,
	DrawerHeader: ({ children }: PropsWithChildren) => <div>{children}</div>,
	DrawerTitle: ({ children }: PropsWithChildren) => <h2>{children}</h2>,
	DrawerDescription: ({ children }: PropsWithChildren) => <p>{children}</p>,
}))

function Wrapper({ children }: PropsWithChildren) {
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
	return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

function renderDrawer() {
	return render(<HouseholdJoinDrawer trigger={<button>Join</button>} />, { wrapper: Wrapper })
}

const push = vi.fn()

describe('HouseholdJoinDrawer', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(useRouter).mockReturnValue({ push } as unknown as ReturnType<typeof useRouter>)
	})

	it('renders the trigger', () => {
		renderDrawer()
		expect(screen.getByRole('button', { name: 'Join' })).toBeInTheDocument()
	})

	it('renders the title and invite code field', () => {
		renderDrawer()
		expect(screen.getByText('title')).toBeInTheDocument()
		expect(screen.getByPlaceholderText('invite-code.placeholder')).toBeInTheDocument()
	})

	it('disables submit until a code is entered', () => {
		renderDrawer()
		expect(screen.getByRole('button', { name: 'submit-button' })).toBeDisabled()
	})

	it('joins the household and navigates on success', async () => {
		vi.mocked(joinHousehold).mockResolvedValue({ success: true, data: { id: 'household-1' } } as Awaited<ReturnType<typeof joinHousehold>>)
		const user = userEvent.setup()
		renderDrawer()

		await user.type(screen.getByPlaceholderText('invite-code.placeholder'), 'abc123')
		await user.click(screen.getByRole('button', { name: 'submit-button' }))

		await waitFor(() => expect(joinHousehold).toHaveBeenCalledWith('ABC123'))
		await waitFor(() => expect(push).toHaveBeenCalledWith('/household/household-1'))
	})

	it('shows a root error and does not navigate on failure', async () => {
		vi.mocked(joinHousehold).mockResolvedValue({ success: false, error: 'Invalid code' } as Awaited<ReturnType<typeof joinHousehold>>)
		const user = userEvent.setup()
		renderDrawer()

		// react-query's mutation observer leaves an internal promise unhandled when `onSuccess` throws
		// (a known upstream quirk — see TanStack/query#5680), so suppress it for this expected path.
		const onUnhandledRejection = (reason: unknown) => {
			if (reason instanceof Error && reason.message === 'Invalid code') return
			throw reason
		}
		process.on('unhandledRejection', onUnhandledRejection)

		await user.type(screen.getByPlaceholderText('invite-code.placeholder'), 'abc123')
		await user.click(screen.getByRole('button', { name: 'submit-button' }))

		expect(await screen.findByText('Invalid code')).toBeInTheDocument()
		expect(push).not.toHaveBeenCalled()

		process.off('unhandledRejection', onUnhandledRejection)
	})
})
