import { TooltipProvider } from '@atoms/tooltip'
import { SplitStrategy } from '@lib/constants/split-strategy.enum'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SplitStrategyDropdown } from './split-strategy-dropdown'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

beforeAll(() => {
	globalThis.ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
})

function renderDropdown(overrides: Partial<React.ComponentProps<typeof SplitStrategyDropdown>> = {}) {
	return render(
		<TooltipProvider>
			<SplitStrategyDropdown name='split' value={SplitStrategy.EQUAL} onChange={vi.fn()} {...overrides} />
		</TooltipProvider>,
	)
}

describe('SplitStrategyDropdown', () => {
	it('sets the id attribute on the trigger from name', () => {
		renderDropdown()
		expect(screen.getByRole('button')).toHaveAttribute('id', 'split')
	})

	it('shows the currently selected option name in the trigger', () => {
		renderDropdown({ value: SplitStrategy.CUSTOM_PERCENTAGES })
		expect(screen.getByRole('button')).toHaveTextContent('options.custom_percentages.name')
	})

	it('disables the trigger when disabled is true', () => {
		renderDropdown({ disabled: true })
		expect(screen.getByRole('button')).toBeDisabled()
	})

	it('does not disable the trigger by default', () => {
		renderDropdown()
		expect(screen.getByRole('button')).not.toBeDisabled()
	})

	it('does not render the menu items before the trigger is opened', () => {
		renderDropdown()
		expect(screen.queryByRole('menuitemradio')).not.toBeInTheDocument()
	})

	it('opens the radio group with every split strategy when the trigger is clicked', async () => {
		const user = userEvent.setup()
		renderDropdown()

		await user.click(screen.getByRole('button'))

		const items = screen.getAllByRole('menuitemradio')
		expect(items).toHaveLength(5)
		expect(items.map((item) => item.textContent)).toEqual([
			'options.equal.name',
			'options.proportional_to_income.name',
			'options.custom_percentages.name',
			'options.round_robin.name',
			'options.custom_amounts.name',
		])
	})

	it('marks the current value as checked and the rest as unchecked', async () => {
		const user = userEvent.setup()
		renderDropdown({ value: SplitStrategy.ROUND_ROBIN })

		await user.click(screen.getByRole('button'))

		const items = screen.getAllByRole('menuitemradio')
		const checked = items.filter((item) => item.getAttribute('aria-checked') === 'true')
		expect(checked).toHaveLength(1)
		expect(checked[0]).toHaveTextContent('options.round_robin.name')
	})

	it('calls onChange with the clicked strategy', async () => {
		const user = userEvent.setup()
		const onChange = vi.fn()
		renderDropdown({ onChange })

		await user.click(screen.getByRole('button'))
		await user.click(screen.getByText('options.proportional_to_income.name'))

		expect(onChange).toHaveBeenCalledWith(SplitStrategy.PROPORTIONAL_TO_INCOME)
	})

	it('does not change the displayed value on its own since it is a controlled component', async () => {
		const user = userEvent.setup()
		renderDropdown({ value: SplitStrategy.EQUAL, onChange: vi.fn() })

		await user.click(screen.getByRole('button'))
		await user.click(screen.getByText('options.custom_amounts.name'))

		expect(screen.getByRole('button')).toHaveTextContent('options.equal.name')
	})

	it('wraps each option label in a tooltip trigger', async () => {
		const user = userEvent.setup()
		renderDropdown()

		await user.click(screen.getByRole('button'))

		const firstItem = screen.getAllByRole('menuitemradio')[0]
		expect(firstItem.querySelector('[data-slot="tooltip-trigger"]')).toBeInTheDocument()
	})
})
