import type { HouseholdMemberWithRole } from '@households/types'

import { MemberRole } from '@lib/constants/role.enum'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { RolesTransferList } from './roles-transfer-list'

const { householdMock, currentUserMock, isAdminMock, mutateAsync } = vi.hoisted(() => ({
	householdMock: {
		value: {
			id: 'h1',
			members: [] as HouseholdMemberWithRole[],
		},
	},
	currentUserMock: { value: { id: 'u1' } },
	isAdminMock: { value: true },
	mutateAsync: vi.fn(),
}))

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('@households/context/household.context', () => ({
	useHouseholdContext: () => ({ household: householdMock.value, isAdmin: isAdminMock.value }),
}))

vi.mock('@hooks/use-current-user', () => ({
	useCurrentUser: () => ({ user: currentUserMock.value, isAuthenticated: true }),
}))

vi.mock('@households/hooks/forms/use-save-member-roles.hook', () => ({
	useSaveMemberRoles: () => ({ mutateAsync, isPending: false }),
}))

vi.mock('@households/components/household-settings/remove-member-button', () => ({
	RemoveMemberButton: () => null,
}))

const MEMBERS: HouseholdMemberWithRole[] = [
	{ id: 'u1', memberId: 'm1', name: 'Alice', email: 'alice@example.com', image: null, role: MemberRole.ADMIN },
	{ id: 'u2', memberId: 'm2', name: 'Bob', email: 'bob@example.com', image: null, role: MemberRole.MEMBER },
]

describe('RolesTransferList', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		householdMock.value = { id: 'h1', members: MEMBERS }
		currentUserMock.value = { id: 'u1' }
		isAdminMock.value = true
	})

	it('renders nothing when the current user is not an admin', () => {
		isAdminMock.value = false
		const { container } = render(<RolesTransferList />)

		expect(container).toBeEmptyDOMElement()
	})

	it('shows each member name and email', () => {
		render(<RolesTransferList />)

		expect(screen.getByText('Alice')).toBeInTheDocument()
		expect(screen.getByText('alice@example.com')).toBeInTheDocument()
		expect(screen.getByText('Bob')).toBeInTheDocument()
		expect(screen.getByText('bob@example.com')).toBeInTheDocument()
	})

	it('disables the row for the current session user so they cannot reassign themselves', () => {
		render(<RolesTransferList />)

		const currentUserRow = screen.getByText('alice@example.com').closest('button')
		const otherRow = screen.getByText('bob@example.com').closest('button')

		expect(currentUserRow).toBeDisabled()
		expect(otherRow).not.toBeDisabled()
	})

	it('marks the current session user with a "you" indicator', () => {
		render(<RolesTransferList />)
		expect(screen.getByText(/you/i)).toBeInTheDocument()
	})

	it('disables the save button while the form is pristine', () => {
		render(<RolesTransferList />)
		expect(screen.getByRole('button', { name: 'save' })).toBeDisabled()
	})

	it('enables the save button once an assignment changes', async () => {
		const user = userEvent.setup()
		render(<RolesTransferList />)

		await user.click(screen.getByText('Bob'))
		await user.click(screen.getByLabelText('move-selected-right'))

		await waitFor(() => expect(screen.getByRole('button', { name: 'save' })).toBeEnabled())
	})

	it('shows the last-admin message before submitting once every member is moved to the member column', async () => {
		const user = userEvent.setup()
		householdMock.value = {
			id: 'h1',
			members: [
				{ id: 'u1', memberId: 'm1', name: 'Alice', email: 'alice@example.com', image: null, role: MemberRole.MEMBER },
				{ id: 'u2', memberId: 'm2', name: 'Bob', email: 'bob@example.com', image: null, role: MemberRole.ADMIN },
			],
		}
		render(<RolesTransferList />)

		await user.click(screen.getByText('Bob'))
		await user.click(screen.getByLabelText('move-selected-left'))

		expect(screen.getByText('last-admin-error')).toBeInTheDocument()
	})

	it('submits the mutation with the plain assignments map once enabled', async () => {
		mutateAsync.mockResolvedValue(undefined)
		const user = userEvent.setup()
		render(<RolesTransferList />)

		await user.click(screen.getByText('Bob'))
		await user.click(screen.getByLabelText('move-selected-right'))

		const saveButton = screen.getByRole('button', { name: 'save' })
		await waitFor(() => expect(saveButton).toBeEnabled())
		await user.click(saveButton)

		await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1))
		expect(mutateAsync).toHaveBeenCalledWith({ m1: MemberRole.ADMIN, m2: MemberRole.ADMIN })
	})
})
