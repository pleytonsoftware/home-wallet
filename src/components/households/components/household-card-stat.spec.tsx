import { render, screen } from '@testing-library/react'

import { HouseholdCardStats } from './household-card-stat'

describe('HouseholdCardStats', () => {
	it('renders the label text', () => {
		render(<HouseholdCardStats text='Balance' amount={100} currency='USD' locale='en-US' />)
		expect(screen.getByText('Balance')).toBeInTheDocument()
	})

	it('formats and renders the amount using the given currency and locale', () => {
		render(<HouseholdCardStats text='Balance' amount={100} currency='USD' locale='en-US' />)
		expect(screen.getByText('$100')).toBeInTheDocument()
	})

	it('formats the amount with a different currency and locale', () => {
		render(<HouseholdCardStats text='Balance' amount={1000} currency='EUR' locale='de-DE' />)
		expect(screen.getByText('1.000 €')).toBeInTheDocument()
	})

	it('falls back to default currency and locale when not provided', () => {
		render(<HouseholdCardStats text='Balance' amount={100} />)
		expect(screen.getByText('$100')).toBeInTheDocument()
	})
})
