/* eslint-disable @typescript-eslint/consistent-type-imports */
import { TooltipProvider } from '@atoms/tooltip'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { RemoveMemberButton } from './remove-member-button'

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }))

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string, values?: Record<string, unknown>) => (values ? `${key}:${JSON.stringify(values)}` : key),
}))

vi.mock('@households/hooks/mutations/remove-member.hook', () => ({
	removeMemberMutationOptions: () => ({ mutationFn: vi.fn() }),
}))

vi.mock('@tanstack/react-query', async (importOriginal) => ({
	...(await importOriginal<typeof import('@tanstack/react-query')>()),
	useMutation: () => ({ mutate, isPending: false }),
	useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}))

function getDialogContent() {
	const content = document.querySelector('[data-slot="alert-dialog-content"]')
	if (!content) throw new Error('dialog content not found')
	return content as HTMLElement
}

function renderButton(props: React.ComponentProps<typeof RemoveMemberButton>) {
	return render(
		<TooltipProvider>
			<RemoveMemberButton {...props} />
		</TooltipProvider>,
	)
}

describe('RemoveMemberButton', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('opens a confirmation dialog naming the member before removing them', async () => {
		const user = userEvent.setup()
		renderButton({ householdId: 'h1', memberId: 'm2', memberName: 'Bob' })

		await user.click(screen.getByRole('button', { name: 'remove.trigger' }))

		expect(within(getDialogContent()).getByText(/Bob/)).toBeInTheDocument()
	})

	it('calls the remove mutation with the target membership id once confirmed', async () => {
		const user = userEvent.setup()
		renderButton({ householdId: 'h1', memberId: 'm2', memberName: 'Bob' })

		await user.click(screen.getByRole('button', { name: 'remove.trigger' }))
		const confirmButton = within(getDialogContent()).getByRole('button', { name: 'remove.confirm-button' })
		await user.click(confirmButton)

		expect(mutate).toHaveBeenCalledWith('m2')
	})
})
