import type { HouseholdDetail } from '@households/types'

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { DangerZone } from './danger-zone'

const { householdMock, isAdminMock, regenerateMock, leaveMock, deleteMock } = vi.hoisted(() => ({
	householdMock: { value: {} as HouseholdDetail },
	isAdminMock: { value: true },
	regenerateMock: { mutateAsync: vi.fn(), isPending: false, error: undefined as Error | undefined, data: undefined as unknown },
	leaveMock: { mutateAsync: vi.fn(), isPending: false, error: undefined as Error | undefined },
	deleteMock: { mutateAsync: vi.fn(), isPending: false, error: undefined as Error | undefined },
}))

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string, values?: Record<string, unknown>) => (values ? `${key}:${JSON.stringify(values)}` : key),
}))

vi.mock('@households/context/household.context', () => ({
	useHouseholdContext: () => ({ household: householdMock.value, isAdmin: isAdminMock.value }),
}))

vi.mock('@households/hooks/forms/use-danger-zone-actions.hook', () => ({
	useDangerZoneActions: () => ({ regenerate: regenerateMock, leave: leaveMock, deleteHousehold: deleteMock }),
}))

function makeHousehold(overrides?: Partial<HouseholdDetail>): HouseholdDetail {
	return {
		id: 'h1',
		name: 'My House',
		code: 'ABC123',
		isOwner: false,
		isInviteCodeOnCooldown: false,
		...overrides,
	} as HouseholdDetail
}

function getDialogContent() {
	const content = document.querySelector('[data-slot="alert-dialog-content"]')
	if (!content) throw new Error('dialog content not found')
	return content as HTMLElement
}

describe('DangerZone', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		regenerateMock.error = undefined
		regenerateMock.data = undefined
		leaveMock.error = undefined
		deleteMock.error = undefined
	})

	describe('as an admin (not owner)', () => {
		beforeEach(() => {
			isAdminMock.value = true
			householdMock.value = makeHousehold({ isOwner: false })
		})

		it('shows the regenerate row with the current invite code', () => {
			render(<DangerZone />)
			expect(screen.getByText('regenerate-code.label', { selector: 'p' })).toBeInTheDocument()
			expect(screen.getByText('ABC123')).toBeInTheDocument()
		})

		it('hides the leave and delete rows', () => {
			render(<DangerZone />)
			expect(screen.queryByText('leave.label')).not.toBeInTheDocument()
			expect(screen.queryByText('delete.label')).not.toBeInTheDocument()
		})

		it('calls regenerate.mutateAsync when confirmed', async () => {
			const user = userEvent.setup()
			render(<DangerZone />)

			await user.click(screen.getByRole('button', { name: 'regenerate-code.label' }))
			const confirmButton = within(getDialogContent()).getByRole('button', { name: 'regenerate-code.label' })
			await user.click(confirmButton)

			expect(regenerateMock.mutateAsync).toHaveBeenCalledTimes(1)
		})

		it('displays the freshly regenerated code from the mutation result', () => {
			regenerateMock.data = { success: true, data: { code: 'NEW999' } }
			render(<DangerZone />)
			expect(screen.getByText('NEW999')).toBeInTheDocument()
		})
	})

	describe('as a regular member (non-admin, non-owner)', () => {
		beforeEach(() => {
			isAdminMock.value = false
			householdMock.value = makeHousehold({ isOwner: false })
		})

		it('shows only the leave row', () => {
			render(<DangerZone />)
			expect(screen.getByText('leave.label', { selector: 'p' })).toBeInTheDocument()
			expect(screen.queryByText('regenerate-code.label')).not.toBeInTheDocument()
			expect(screen.queryByText('delete.label')).not.toBeInTheDocument()
		})

		it('calls leave.mutateAsync when confirmed', async () => {
			const user = userEvent.setup()
			render(<DangerZone />)

			await user.click(screen.getByRole('button', { name: 'leave.label' }))
			const confirmButton = within(getDialogContent()).getByRole('button', { name: 'leave.label' })
			await user.click(confirmButton)

			expect(leaveMock.mutateAsync).toHaveBeenCalledTimes(1)
		})
	})

	describe('as the owner', () => {
		beforeEach(() => {
			isAdminMock.value = true
			householdMock.value = makeHousehold({ isOwner: true, name: 'My House' })
		})

		it('shows the delete row', () => {
			render(<DangerZone />)
			expect(screen.getByText('delete.label', { selector: 'p' })).toBeInTheDocument()
		})

		it('keeps the delete confirm action disabled until the typed name matches', async () => {
			const user = userEvent.setup()
			render(<DangerZone />)

			await user.click(screen.getByRole('button', { name: 'delete.label' }))
			const dialog = getDialogContent()
			const confirmButton = within(dialog).getByRole('button', { name: 'delete.label' })

			expect(confirmButton).toBeDisabled()

			await user.type(within(dialog).getByRole('textbox'), 'My House')

			expect(confirmButton).toBeEnabled()
		})

		it('calls deleteHousehold.mutateAsync with the typed name once confirmed', async () => {
			const user = userEvent.setup()
			render(<DangerZone />)

			await user.click(screen.getByRole('button', { name: 'delete.label' }))
			const dialog = getDialogContent()
			await user.type(within(dialog).getByRole('textbox'), 'My House')
			await user.click(within(dialog).getByRole('button', { name: 'delete.label' }))

			expect(deleteMock.mutateAsync).toHaveBeenCalledWith('My House')
		})
	})

	describe('error scoping between dialogs', () => {
		beforeEach(() => {
			isAdminMock.value = true
			householdMock.value = makeHousehold({ isOwner: true, name: 'My House' })
		})

		it('only shows the regenerate error under the regenerate row, not under delete', () => {
			regenerateMock.error = new Error('regenerate failed')
			render(<DangerZone />)

			expect(screen.getByText('regenerate failed')).toBeInTheDocument()
			expect(deleteMock.error).toBeUndefined()
		})

		it('only shows the delete error under the delete row, not under regenerate', () => {
			deleteMock.error = new Error('delete failed')
			render(<DangerZone />)

			expect(screen.getByText('delete failed')).toBeInTheDocument()
			expect(regenerateMock.error).toBeUndefined()
		})
	})
})
