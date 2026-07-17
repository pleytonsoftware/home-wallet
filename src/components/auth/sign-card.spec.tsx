/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { render, screen } from '@testing-library/react'

import { SignCard } from './sign-card'

vi.mock('next/image', () => ({
	default: ({ fill, priority, ...props }: React.ComponentProps<'img'> & { fill?: boolean; priority?: boolean }) => <img {...props} />,
}))

describe('SignCard', () => {
	it('renders the image with the given url and default alt text', () => {
		render(<SignCard imageUrl='/hero.webp'>content</SignCard>)
		const img = screen.getByAltText('Sign in')
		expect(img).toHaveAttribute('src', '/hero.webp')
	})

	it('renders a custom image alt text', () => {
		render(
			<SignCard imageUrl='/hero.webp' imageAlt='Custom alt'>
				content
			</SignCard>,
		)
		expect(screen.getByAltText('Custom alt')).toBeInTheDocument()
	})

	it('renders children', () => {
		render(
			<SignCard imageUrl='/hero.webp'>
				<span>form content</span>
			</SignCard>,
		)
		expect(screen.getByText('form content')).toBeInTheDocument()
	})

	it('renders additional content when provided', () => {
		render(
			<SignCard imageUrl='/hero.webp' additionalContent={<div>extra</div>}>
				content
			</SignCard>,
		)
		expect(screen.getByText('extra')).toBeInTheDocument()
	})

	it('does not render additional content when omitted', () => {
		render(<SignCard imageUrl='/hero.webp'>content</SignCard>)
		expect(screen.queryByText('extra')).not.toBeInTheDocument()
	})
})
