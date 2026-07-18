import { render, screen } from '@testing-library/react'

import { Logo } from './logo'

describe('Logo', () => {
	it('renders the logo image with the expected alt text', () => {
		render(<Logo />)
		expect(screen.getByRole('img')).toHaveAttribute('alt', `${process.env.NEXT_PUBLIC_APP_NAME} logo`)
	})

	it('renders the image title attribute matching the app name', () => {
		render(<Logo />)
		expect(screen.getByRole('img').getAttribute('title')).toBe(process.env.NEXT_PUBLIC_APP_NAME ?? null)
	})

	it('renders the text span by default', () => {
		const { container } = render(<Logo />)
		expect(container.querySelector('.font-title')).toBeInTheDocument()
	})

	it('does not render the text span when text is false', () => {
		const { container } = render(<Logo text={false} />)
		expect(container.querySelector('.font-title')).not.toBeInTheDocument()
	})

	it('applies a custom className to the wrapper', () => {
		const { container } = render(<Logo className='custom-wrapper' />)
		expect(container.querySelector('.custom-wrapper')).toBeInTheDocument()
	})

	it('applies a custom imgClassName to the image', () => {
		render(<Logo imgClassName='custom-img' />)
		expect(screen.getByRole('img')).toHaveClass('custom-img')
	})

	it('applies a custom textClassName to the text span', () => {
		const { container } = render(<Logo textClassName='custom-text' />)
		expect(container.querySelector('.custom-text')).toBeInTheDocument()
	})

	it('renders the image with the expected source path', () => {
		render(<Logo />)
		expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('home-wallet.png'))
	})
})
