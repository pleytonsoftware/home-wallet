import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { CurrencyCombobox } from './currency-combobox'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
	useLocale: () => 'en',
}))

function getItems() {
	return Array.from(document.querySelectorAll('[data-slot="combobox-item"]'))
}

describe('CurrencyCombobox', () => {
	it('renders the input with the default translated placeholder', () => {
		render(<CurrencyCombobox name='currency' onChange={vi.fn()} />)
		expect(screen.getByRole('combobox')).toHaveAttribute('placeholder', 'placeholder')
	})

	it('renders a custom placeholder overriding the translated default', () => {
		render(<CurrencyCombobox name='currency' onChange={vi.fn()} placeholder='Choose a currency' />)
		expect(screen.getByRole('combobox')).toHaveAttribute('placeholder', 'Choose a currency')
	})

	it('sets the id and name attributes on the input', () => {
		render(<CurrencyCombobox id='currency-field' name='currency' onChange={vi.fn()} />)
		const input = screen.getByRole('combobox')
		expect(input).toHaveAttribute('id', 'currency-field')
		expect(input).toHaveAttribute('name', 'currency')
	})

	it('marks the input as data-disabled when disabled is true', () => {
		render(<CurrencyCombobox name='currency' onChange={vi.fn()} disabled />)
		expect(screen.getByRole('combobox')).toHaveAttribute('data-disabled')
	})

	it('does not mark the input as disabled by default', () => {
		render(<CurrencyCombobox name='currency' onChange={vi.fn()} />)
		expect(screen.getByRole('combobox')).not.toHaveAttribute('data-disabled')
	})

	it('shows the popular currencies first with an empty query', async () => {
		const user = userEvent.setup()
		render(<CurrencyCombobox name='currency' onChange={vi.fn()} />)

		await user.click(screen.getByRole('combobox'))

		const codes = getItems()
			.slice(0, 3)
			.map((item) => item.textContent)
		expect(codes[0]).toContain('USD')
		expect(codes[1]).toContain('EUR')
		expect(codes[2]).toContain('GBP')
	})

	it('filters the list by currency code', async () => {
		const user = userEvent.setup()
		render(<CurrencyCombobox name='currency' onChange={vi.fn()} />)

		const input = screen.getByRole('combobox')
		await user.click(input)
		await user.type(input, 'eur')

		const codes = getItems().map((item) => item.textContent)
		expect(codes.some((text) => text?.startsWith('EUR'))).toBe(true)
		expect(codes.every((text) => text?.toLowerCase().includes('eur'))).toBe(true)
	})

	it('filters the list by currency name', async () => {
		const user = userEvent.setup()
		render(<CurrencyCombobox name='currency' onChange={vi.fn()} />)

		const input = screen.getByRole('combobox')
		await user.click(input)
		await user.type(input, 'franc')

		const codes = getItems().map((item) => item.textContent)
		expect(codes.some((text) => text?.startsWith('CHF'))).toBe(true)
		expect(codes.every((text) => text?.toLowerCase().includes('franc'))).toBe(true)
	})

	it('shows the default empty-state label when no currencies match', async () => {
		const user = userEvent.setup()
		render(<CurrencyCombobox name='currency' onChange={vi.fn()} />)

		const input = screen.getByRole('combobox')
		await user.click(input)
		await user.type(input, 'not-a-real-currency')

		expect(document.querySelector('[data-slot="combobox-empty"]')).toHaveTextContent('empty')
	})

	it('shows a custom empty label when provided', async () => {
		const user = userEvent.setup()
		render(<CurrencyCombobox name='currency' onChange={vi.fn()} emptyLabel='No matches found' />)

		const input = screen.getByRole('combobox')
		await user.click(input)
		await user.type(input, 'not-a-real-currency')

		expect(document.querySelector('[data-slot="combobox-empty"]')).toHaveTextContent('No matches found')
	})

	it('calls onChange with the selected currency code', async () => {
		const user = userEvent.setup()
		const onChange = vi.fn()
		render(<CurrencyCombobox name='currency' onChange={onChange} />)

		const input = screen.getByRole('combobox')
		await user.click(input)
		await user.type(input, 'eur')

		const [firstMatch] = getItems()
		await user.click(firstMatch)

		expect(onChange).toHaveBeenCalledWith('EUR')
	})
})
