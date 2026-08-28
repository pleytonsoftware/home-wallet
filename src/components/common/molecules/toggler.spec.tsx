import type { ComponentProps } from 'react'

import { CircleIcon, SquareIcon } from 'lucide-react'

import { TooltipProvider } from '@atoms/tooltip'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Toggler, type TogglerOption } from './toggler'

type Mode = 'a' | 'b'

const options: Array<TogglerOption<Mode>> = [
	{ value: 'a', label: 'Option A', Icon: CircleIcon },
	{ value: 'b', label: 'Option B', Icon: SquareIcon },
]

beforeAll(() => {
	globalThis.ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
})

function renderToggler(overrides: Partial<ComponentProps<typeof Toggler<Mode>>> = {}) {
	const onChange = vi.fn()
	const utils = render(
		<TooltipProvider>
			<Toggler value='a' onChange={onChange} options={options} {...overrides} />
		</TooltipProvider>,
	)
	return { onChange, ...utils }
}

describe('Toggler', () => {
	it('renders every option label', () => {
		renderToggler()
		expect(screen.getByText('Option A')).toBeInTheDocument()
		expect(screen.getByText('Option B')).toBeInTheDocument()
	})

	it('renders as a radiogroup with radio items', () => {
		renderToggler()
		expect(screen.getByRole('radiogroup')).toBeInTheDocument()
		expect(screen.getAllByRole('radio')).toHaveLength(2)
	})

	it('marks the active option as checked', () => {
		renderToggler()
		expect(screen.getByRole('radio', { name: 'Option A' })).toHaveAttribute('aria-checked', 'true')
		expect(screen.getByRole('radio', { name: 'Option B' })).toHaveAttribute('aria-checked', 'false')
	})

	it('calls onChange with the selected value when an option is clicked', async () => {
		const user = userEvent.setup()
		const { onChange } = renderToggler()

		await user.click(screen.getByRole('radio', { name: 'Option B' }))

		expect(onChange).toHaveBeenCalledWith('b')
	})

	it('does not call onChange when clicking the already active option', async () => {
		const user = userEvent.setup()
		const { onChange } = renderToggler()

		await user.click(screen.getByRole('radio', { name: 'Option A' }))

		expect(onChange).not.toHaveBeenCalled()
	})

	it('disables an option and prevents selection', async () => {
		const user = userEvent.setup()
		const { onChange } = renderToggler({
			options: [options[0], { ...options[1], disabled: true }],
		})

		const disabledOption = screen.getByRole('radio', { name: 'Option B' })
		expect(disabledOption).toBeDisabled()

		await user.click(disabledOption)
		expect(onChange).not.toHaveBeenCalled()
	})

	it('does not render an icon when Icon is omitted', () => {
		const { container } = renderToggler({
			options: [
				{ value: 'a', label: 'Option A' },
				{ value: 'b', label: 'Option B' },
			],
		})
		expect(container.querySelector('svg')).not.toBeInTheDocument()
	})

	it('does not render a tooltip when no tooltip is provided', () => {
		renderToggler()
		expect(screen.queryByText('Coming soon')).not.toBeInTheDocument()
	})

	it('shows tooltip content on hover when a tooltip is provided', async () => {
		const user = userEvent.setup()
		renderToggler({
			options: [options[0], { ...options[1], disabled: true, tooltip: 'Coming soon' }],
		})

		expect(screen.queryByText('Coming soon')).not.toBeInTheDocument()

		await user.hover(screen.getByRole('radio', { name: 'Option B' }))

		// Radix's controlled Tooltip commits its content twice on this open transition (a
		// framework-level rendering quirk, not an app bug), so assert presence via
		// `getAllByText` rather than the stricter single-match `getByText`.
		await waitFor(() => expect(screen.getAllByText('Coming soon').length).toBeGreaterThan(0))
	})

	it('applies the ariaLabel to the toggle item', () => {
		renderToggler({
			options: [
				{ value: 'a', label: 'A', ariaLabel: 'first option' },
				{ value: 'b', label: 'B', ariaLabel: 'second option' },
			],
		})
		expect(screen.getByRole('radio', { name: 'first option' })).toBeInTheDocument()
		expect(screen.getByRole('radio', { name: 'second option' })).toBeInTheDocument()
	})

	it('applies labelClassName to option labels', () => {
		renderToggler({ labelClassName: 'sm:hidden' })
		expect(screen.getByText('Option A')).toHaveClass('sm:hidden')
	})

	it('applies a custom className to the toggle group', () => {
		renderToggler({ className: 'custom-toggle' })
		expect(screen.getByRole('radiogroup')).toHaveClass('custom-toggle')
	})
})
