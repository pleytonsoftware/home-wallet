import { render, screen } from '@testing-library/react'

import { Title } from './title'

describe('Title', () => {
	it('renders the title inside a level 2 heading', () => {
		render(<Title title='My title' />)
		expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('My title')
	})

	it('renders the subtitle when provided', () => {
		render(<Title title='My title' subtitle='My subtitle' />)
		expect(screen.getByText('My subtitle')).toBeInTheDocument()
	})

	it('does not render the subtitle when omitted', () => {
		const { container } = render(<Title title='My title' />)
		expect(container.querySelector('p')).not.toBeInTheDocument()
	})

	it('does not render the subtitle when empty', () => {
		const { container } = render(<Title title='My title' subtitle='' />)
		expect(container.querySelector('p')).not.toBeInTheDocument()
	})

	it('renders the header landmark', () => {
		render(<Title title='My title' />)
		expect(screen.getByRole('banner')).toBeInTheDocument()
	})
})
