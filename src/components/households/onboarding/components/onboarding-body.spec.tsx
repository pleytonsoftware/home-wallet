import type { OnboardingOption } from '@households/onboarding/types'

import { useState } from 'react'

import { useForm } from 'react-hook-form'

import { OnboardingProvider } from '@households/onboarding/context/onboarding.context'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OnboardingBody } from './onboarding-body'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

function TestWrapper({
	handleSubmit,
	initialView = 'create',
	onToggleView,
}: {
	handleSubmit: (data: { email: string }) => void | Promise<void>
	initialView?: OnboardingOption
	onToggleView?: () => void
}) {
	const form = useForm({ defaultValues: { email: '' } })
	const [view, setView] = useState<OnboardingOption>(initialView)

	return (
		<OnboardingProvider value={{ view, setView, onToggleView }}>
			<OnboardingBody
				form={form}
				handleSubmit={handleSubmit}
				formControls={<input placeholder='email' {...form.register('email')} />}
				submitLabel='Submit'
			/>
		</OnboardingProvider>
	)
}

describe('OnboardingBody', () => {
	it('renders the form controls and submit label', () => {
		render(<TestWrapper handleSubmit={vi.fn()} />)
		expect(screen.getByPlaceholderText('email')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument()
	})

	it('calls handleSubmit when the form is submitted', async () => {
		const handleSubmit = vi.fn()
		const user = userEvent.setup()
		render(<TestWrapper handleSubmit={handleSubmit} />)

		await user.type(screen.getByPlaceholderText('email'), 'jane@example.com')
		await user.click(screen.getByRole('button', { name: 'Submit' }))

		expect(handleSubmit).toHaveBeenCalledWith(expect.objectContaining({ email: 'jane@example.com' }), expect.anything())
	})

	it('shows the create toggle label when the view is create', () => {
		render(<TestWrapper handleSubmit={vi.fn()} initialView='create' />)
		expect(screen.getByText('create.invite-code')).toBeInTheDocument()
	})

	it('shows the join toggle label when the view is join', () => {
		render(<TestWrapper handleSubmit={vi.fn()} initialView='join' />)
		expect(screen.getByText('join.create-new')).toBeInTheDocument()
	})

	it('toggles the view and calls onToggleView when the toggle is clicked', async () => {
		const onToggleView = vi.fn()
		const user = userEvent.setup()
		render(<TestWrapper handleSubmit={vi.fn()} initialView='create' onToggleView={onToggleView} />)

		await user.click(screen.getByText('create.invite-code'))

		expect(screen.getByText('join.create-new')).toBeInTheDocument()
		expect(onToggleView).toHaveBeenCalledTimes(1)
	})
})
