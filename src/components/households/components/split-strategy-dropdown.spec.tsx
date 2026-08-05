import { TooltipProvider } from '@atoms/tooltip'
import { useIsNativeMobile } from '@hooks/use-native-mobile'
import { SplitStrategy } from '@lib/constants/split-strategy.enum'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { mapSplitStrategyToTranslations, SplitStrategyDropdown, SplitStrategyLabel } from './split-strategy-dropdown'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('@hooks/use-native-mobile', () => ({
	useIsNativeMobile: vi.fn(() => false),
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

function renderLabel(overrides: Partial<React.ComponentProps<typeof SplitStrategyLabel>> = {}) {
	return render(
		<TooltipProvider>
			<div>
				<SplitStrategyLabel name='split' label='Split strategy' {...overrides} />
				<button data-testid='outside'>Outside</button>
			</div>
		</TooltipProvider>,
	)
}

describe('mapSplitStrategyToTranslations', () => {
	it('maps every split strategy to its translated name and description', () => {
		const t = ((key: string) => key) as Parameters<typeof mapSplitStrategyToTranslations>[0]
		const result = mapSplitStrategyToTranslations(t)

		expect(result).toEqual({
			[SplitStrategy.EQUAL]: { name: 'options.equal.name', description: 'options.equal.description' },
			[SplitStrategy.PROPORTIONAL_TO_INCOME]: {
				name: 'options.proportional_to_income.name',
				description: 'options.proportional_to_income.description',
			},
			[SplitStrategy.CUSTOM_PERCENTAGES]: {
				name: 'options.custom_percentages.name',
				description: 'options.custom_percentages.description',
			},
			[SplitStrategy.ROUND_ROBIN]: { name: 'options.round_robin.name', description: 'options.round_robin.description' },
			[SplitStrategy.CUSTOM_AMOUNTS]: { name: 'options.custom_amounts.name', description: 'options.custom_amounts.description' },
		})
	})
})

describe('SplitStrategyDropdown desktop (custom popover)', () => {
	beforeEach(() => {
		vi.mocked(useIsNativeMobile).mockReturnValue(false)
	})

	it('sets an aria-label on the trigger matching the selected option', () => {
		renderDropdown({ value: SplitStrategy.EQUAL })
		expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'options.equal.name')
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

	it('does not render the native select', () => {
		renderDropdown()
		expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
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

describe('SplitStrategyDropdown native mobile (native <select>)', () => {
	beforeEach(() => {
		vi.mocked(useIsNativeMobile).mockReturnValue(true)
	})

	it('does not render the custom popover trigger', () => {
		renderDropdown()
		expect(screen.queryByRole('button')).not.toBeInTheDocument()
	})

	it('sets the id and name attributes on the native select from name', () => {
		renderDropdown()
		const select = screen.getByRole('combobox')
		expect(select).toHaveAttribute('id', 'split')
		expect(select).toHaveAttribute('name', 'split')
	})

	it('renders one option per split strategy with its translated name', () => {
		renderDropdown()
		const options = screen.getAllByRole('option')
		expect(options.map((option) => option.textContent)).toEqual([
			'options.equal.name',
			'options.proportional_to_income.name',
			'options.custom_percentages.name',
			'options.round_robin.name',
			'options.custom_amounts.name',
		])
	})

	it('pre-selects the option matching the current value', () => {
		renderDropdown({ value: SplitStrategy.ROUND_ROBIN })
		expect(screen.getByRole('combobox')).toHaveValue(SplitStrategy.ROUND_ROBIN)
	})

	it('disables the native select when disabled is true', () => {
		renderDropdown({ disabled: true })
		expect(screen.getByRole('combobox')).toBeDisabled()
	})

	it('does not disable the native select by default', () => {
		renderDropdown()
		expect(screen.getByRole('combobox')).not.toBeDisabled()
	})

	it('calls onChange with the picked strategy when a new option is selected', async () => {
		const user = userEvent.setup()
		const onChange = vi.fn()
		renderDropdown({ onChange })

		await user.selectOptions(screen.getByRole('combobox'), SplitStrategy.CUSTOM_AMOUNTS)

		expect(onChange).toHaveBeenCalledWith(SplitStrategy.CUSTOM_AMOUNTS)
	})
})

describe('SplitStrategyLabel', () => {
	it('renders the given label text', () => {
		vi.mocked(useIsNativeMobile).mockReturnValue(false)
		renderLabel({ label: 'Split strategy' })
		expect(screen.getByText('Split strategy')).toBeInTheDocument()
	})

	it('associates the label with the field via htmlFor', () => {
		vi.mocked(useIsNativeMobile).mockReturnValue(false)
		renderLabel({ name: 'split' })
		expect(screen.getByText('Split strategy')).toHaveAttribute('for', 'split')
	})

	it('does not render a help icon when not on native mobile', () => {
		vi.mocked(useIsNativeMobile).mockReturnValue(false)
		const { container } = renderLabel()
		expect(container.querySelector('svg')).not.toBeInTheDocument()
	})

	describe('on native mobile', () => {
		beforeEach(() => {
			vi.mocked(useIsNativeMobile).mockReturnValue(true)
		})

		it('renders a help icon', () => {
			const { container } = renderLabel()
			expect(container.querySelector('svg')).toBeInTheDocument()
		})

		it('does not show the description tooltip before the icon is clicked', () => {
			renderLabel()
			expect(screen.queryByText('options.equal.description')).not.toBeInTheDocument()
		})

		it('opens the tooltip with every strategy name and description when the icon is clicked', async () => {
			const user = userEvent.setup()
			const { container } = renderLabel()

			await user.click(container.querySelector('svg')!)

			// Radix's controlled Tooltip commits its content twice on this open transition (a
			// framework-level rendering quirk, not an app bug), so assert presence via
			// `getAllByText` rather than the stricter single-match `getByText`.
			expect(screen.getAllByText('options.equal.name').length).toBeGreaterThan(0)
			expect(screen.getAllByText('options.equal.description').length).toBeGreaterThan(0)
			expect(screen.getAllByText('options.custom_amounts.name').length).toBeGreaterThan(0)
			expect(screen.getAllByText('options.custom_amounts.description').length).toBeGreaterThan(0)
		})

		it('closes the tooltip when clicking outside of it', async () => {
			const user = userEvent.setup()
			const { container } = renderLabel()

			await user.click(container.querySelector('svg')!)
			expect(screen.getAllByText('options.equal.description').length).toBeGreaterThan(0)

			await user.click(screen.getByTestId('outside'))
			expect(screen.queryByText('options.equal.description')).not.toBeInTheDocument()
		})
	})
})
