import type { UseFormStateReturn } from 'react-hook-form'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ResetFormButton } from './reset-form-button'

function makeFormState(isDirty: boolean): UseFormStateReturn<{ name: string }> {
	return { isDirty } as unknown as UseFormStateReturn<{ name: string }>
}

describe('ResetFormButton', () => {
	it('does not render the reset button when the form is not dirty', () => {
		const { container } = render(
			<ResetFormButton formState={makeFormState(false)} reset={vi.fn()}>
				<button type='submit'>Save</button>
			</ResetFormButton>,
		)

		expect(container.querySelectorAll('button')).toHaveLength(1)
	})

	it('renders the reset button when the form is dirty', () => {
		const { container } = render(
			<ResetFormButton formState={makeFormState(true)} reset={vi.fn()}>
				<button type='submit'>Save</button>
			</ResetFormButton>,
		)

		expect(container.querySelectorAll('button')).toHaveLength(2)
	})

	it('always renders children regardless of dirty state', () => {
		render(
			<ResetFormButton formState={makeFormState(false)} reset={vi.fn()}>
				<button type='submit'>Save</button>
			</ResetFormButton>,
		)

		expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
	})

	it('calls reset with no arguments when clicked, not the click event', async () => {
		const reset = vi.fn()
		const user = userEvent.setup()
		const { container } = render(
			<ResetFormButton formState={makeFormState(true)} reset={reset}>
				<button type='submit'>Save</button>
			</ResetFormButton>,
		)

		// The reset button is the first of the two rendered (JSX order: reset icon, then children).
		const resetButton = container.querySelectorAll('button')[0]
		await user.click(resetButton)

		expect(reset).toHaveBeenCalledTimes(1)
		expect(reset).toHaveBeenCalledWith()
	})
})
