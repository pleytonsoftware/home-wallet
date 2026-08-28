import { ACCOUNT_TYPE } from '@lib/constants/account.enum'
import { render, screen } from '@testing-library/react'

import { BankAccountOption, BankAccountTrigger } from './bank-account-option'

describe('BankAccountTrigger', () => {
	it('renders the account type icon and name', () => {
		const { container } = render(<BankAccountTrigger bankAccount={{ name: 'Checking', type: ACCOUNT_TYPE.BANK, lastFourDigits: '1234' }} />)
		expect(container.querySelector('svg.lucide-landmark')).toBeInTheDocument()
		expect(screen.getByText('Checking')).toBeInTheDocument()
	})
})

describe('BankAccountOption', () => {
	it('renders the account type icon, name, and last-4-digits suffix', () => {
		const { container } = render(<BankAccountOption bankAccount={{ name: 'Checking', type: ACCOUNT_TYPE.CREDIT_CARD, lastFourDigits: '1234' }} />)
		expect(container.querySelector('svg.lucide-credit-card')).toBeInTheDocument()
		expect(screen.getByText('Checking')).toBeInTheDocument()
		expect(screen.getByText('· •••• 1234')).toBeInTheDocument()
	})

	it('omits the suffix when there are no last-4-digits', () => {
		render(<BankAccountOption bankAccount={{ name: 'Wallet', type: ACCOUNT_TYPE.CASH, lastFourDigits: null }} />)
		expect(screen.getByText('Wallet')).toBeInTheDocument()
		expect(screen.queryByText(/••••/)).not.toBeInTheDocument()
	})
})
