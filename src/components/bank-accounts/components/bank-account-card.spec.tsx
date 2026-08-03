import type { BankAccountSummary } from '@bank-accounts/types'

import { ACCOUNT_TYPE } from '@lib/constants/account.enum'
import { render, screen } from '@testing-library/react'

import { BankAccountCard } from './bank-account-card'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string, values?: Record<string, unknown>) => (values ? `${key}:${JSON.stringify(values)}` : key),
}))

vi.mock('@bank-accounts/components/bank-account-delete-button', () => ({
	BankAccountDeleteButton: () => <div>delete-button</div>,
}))

vi.mock('@bank-accounts/components/bank-account-form/bank-account-form-sheet', () => ({
	BankAccountFormSheet: () => <div>form-sheet</div>,
}))

function makeAccount(overrides?: Partial<BankAccountSummary>): BankAccountSummary {
	return {
		id: 'a1',
		householdId: 'h1',
		name: 'Joint Checking',
		type: ACCOUNT_TYPE.BANK,
		lastFourDigits: '1234',
		isOwner: true,
		owner: { id: 'm1', name: 'Alice', image: null },
		sharedWith: [],
		createdAt: '2026-01-01T00:00:00.000Z',
		...overrides,
	}
}

describe('BankAccountCard', () => {
	it('shows the edit/delete actions menu when the current user owns the account', () => {
		render(<BankAccountCard bankAccount={makeAccount({ isOwner: true })} />)
		expect(screen.getByRole('button', { name: 'card.actions' })).toBeInTheDocument()
	})

	it('hides the actions menu and the owner avatar for the account owner', () => {
		render(<BankAccountCard bankAccount={makeAccount({ isOwner: true })} />)
		expect(screen.queryByText(/card.owned-by/)).not.toBeInTheDocument()
	})

	it('hides the actions menu and shows who owns it when the account is shared with the current user', () => {
		render(<BankAccountCard bankAccount={makeAccount({ isOwner: false, owner: { id: 'm2', name: 'Bob', image: null } })} />)

		expect(screen.queryByRole('button', { name: 'card.actions' })).not.toBeInTheDocument()
		expect(screen.getByText(/Bob/)).toBeInTheDocument()
	})

	it('shows a "not shared" hint when there are no shared members', () => {
		render(<BankAccountCard bankAccount={makeAccount({ sharedWith: [] })} />)
		expect(screen.getByText('card.not-shared')).toBeInTheDocument()
	})

	it('shows shared-member avatars when the account is shared', () => {
		render(<BankAccountCard bankAccount={makeAccount({ sharedWith: [{ id: 'm2', name: 'Bob', image: null }] })} />)
		expect(screen.queryByText('card.not-shared')).not.toBeInTheDocument()
		expect(screen.getByText('B')).toBeInTheDocument()
	})

	it('renders the last four digits when present', () => {
		render(<BankAccountCard bankAccount={makeAccount({ lastFourDigits: '5678' })} />)
		expect(screen.getByText(/5678/)).toBeInTheDocument()
	})
})
