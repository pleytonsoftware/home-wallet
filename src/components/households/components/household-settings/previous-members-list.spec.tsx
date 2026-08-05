/* eslint-disable @typescript-eslint/consistent-type-imports */
import type { HouseholdDetail, RemovedHouseholdMember } from '@households/types'

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { PreviousMembersList } from './previous-members-list'

const { mutate, invalidateQueries, queryData } = vi.hoisted(() => ({
	mutate: vi.fn(),
	invalidateQueries: vi.fn(),
	queryData: { value: undefined as RemovedHouseholdMember[] | undefined },
}))

const householdMock = { value: { id: 'h1' } as HouseholdDetail }
const isAdminMock = { value: true }

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string, values?: Record<string, unknown>) => (values ? `${key}:${JSON.stringify(values)}` : key),
	useLocale: () => 'en',
}))

vi.mock('@households/context/household.context', () => ({
	useHouseholdContext: () => ({ household: householdMock.value, isAdmin: isAdminMock.value }),
}))

vi.mock('@households/hooks/mutations/hard-delete-member.hook', () => ({
	hardDeletePreviousMemberMutationOptions: () => ({ mutationFn: vi.fn() }),
}))

vi.mock('@tanstack/react-query', async (importOriginal) => ({
	...(await importOriginal<typeof import('@tanstack/react-query')>()),
	useQuery: () => ({ data: queryData.value }),
	useMutation: () => ({ mutate, isPending: false }),
	useQueryClient: () => ({ invalidateQueries }),
}))

function makeMember(overrides?: Partial<RemovedHouseholdMember>): RemovedHouseholdMember {
	return {
		id: 'u1',
		memberId: 'm1',
		name: 'Bob',
		email: 'bob@example.com',
		image: null,
		role: 'MEMBER' as RemovedHouseholdMember['role'],
		removedAt: '2026-01-15T00:00:00.000Z',
		...overrides,
	}
}

function getDialogContent() {
	const content = document.querySelector('[data-slot="alert-dialog-content"]')
	if (!content) throw new Error('dialog content not found')
	return content as HTMLElement
}

describe('PreviousMembersList', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		isAdminMock.value = true
		queryData.value = undefined
	})

	it('lists removed members for a non-admin, without a delete action', () => {
		isAdminMock.value = false
		queryData.value = [makeMember({ name: 'Bob' })]
		render(<PreviousMembersList />)

		expect(screen.getByText('Bob')).toBeInTheDocument()
		expect(screen.queryByRole('button', { name: 'previous.delete-trigger' })).not.toBeInTheDocument()
	})

	it('renders nothing when there are no removed members', () => {
		queryData.value = []
		const { container } = render(<PreviousMembersList />)

		expect(container).toBeEmptyDOMElement()
	})

	it('renders nothing while the removed members query has not resolved', () => {
		queryData.value = undefined
		const { container } = render(<PreviousMembersList />)

		expect(container).toBeEmptyDOMElement()
	})

	it('lists each removed member with their name and removal date', () => {
		queryData.value = [makeMember({ memberId: 'm1', name: 'Bob' }), makeMember({ memberId: 'm2', name: 'Alice' })]
		render(<PreviousMembersList />)

		expect(screen.getByText('Bob')).toBeInTheDocument()
		expect(screen.getByText('Alice')).toBeInTheDocument()
		expect(screen.getAllByRole('button', { name: 'previous.delete-trigger' })).toHaveLength(2)
	})

	it('opens a confirmation dialog naming the member before deleting them', async () => {
		queryData.value = [makeMember({ memberId: 'm1', name: 'Bob' })]
		const user = userEvent.setup()
		render(<PreviousMembersList />)

		await user.click(screen.getByRole('button', { name: 'previous.delete-trigger' }))

		expect(within(getDialogContent()).getByText(/Bob/)).toBeInTheDocument()
	})

	it('calls the delete mutation with the target membership id once confirmed', async () => {
		queryData.value = [makeMember({ memberId: 'm1', name: 'Bob' })]
		const user = userEvent.setup()
		render(<PreviousMembersList />)

		await user.click(screen.getByRole('button', { name: 'previous.delete-trigger' }))
		const confirmButton = within(getDialogContent()).getByRole('button', { name: 'previous.delete-confirm-button' })
		await user.click(confirmButton)

		expect(mutate).toHaveBeenCalledWith('m1')
	})

	it('caps the list height and scrolls instead of growing unbounded', () => {
		queryData.value = [makeMember()]
		const { container } = render(<PreviousMembersList />)
		expect(container.querySelector('ul')).toHaveClass('max-h-72', 'overflow-y-auto')
	})
})
