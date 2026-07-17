import { render, screen } from '@testing-library/react'

import { SignForm } from './sign-form'

describe('SignForm', () => {
	it('renders children', () => {
		render(
			<SignForm>
				<span>field</span>
			</SignForm>,
		)
		expect(screen.getByText('field')).toBeInTheDocument()
	})

	it('does not render an error message by default', () => {
		const { container } = render(<SignForm>content</SignForm>)
		expect(container.querySelector('.text-destructive')).not.toBeInTheDocument()
	})

	it('renders the error message when provided', () => {
		render(<SignForm error='Something went wrong'>content</SignForm>)
		expect(screen.getByText('Something went wrong')).toBeInTheDocument()
	})

	it('marks the fields container as disabled when loading', () => {
		render(<SignForm isLoading>content</SignForm>)
		expect(screen.getByText('content')).toHaveAttribute('aria-disabled', 'true')
	})

	it('does not mark the fields container as disabled by default', () => {
		render(<SignForm>content</SignForm>)
		expect(screen.getByText('content')).toHaveAttribute('aria-disabled', 'false')
	})

	it('applies a reduced-opacity class when loading', () => {
		const { container } = render(<SignForm isLoading>content</SignForm>)
		expect(container.firstChild).toHaveClass('opacity-50')
	})
})
