import { render, screen } from '@testing-library/react'

import { MemberAvatar } from './member-avatar'

describe('MemberAvatar', () => {
	it('renders initials in the fallback when there is no image', () => {
		render(<MemberAvatar member={{ id: 'u1', name: 'Ada Lovelace' }} />)

		expect(screen.getByText('AL')).toBeInTheDocument()
	})

	it('defaults to the sm size', () => {
		const { container } = render(<MemberAvatar member={{ id: 'u1', name: 'Ada Lovelace' }} />)

		expect(container.querySelector('[data-slot="avatar"]')).toHaveAttribute('data-size', 'sm')
	})

	it('respects the size prop', () => {
		const { container } = render(<MemberAvatar member={{ id: 'u1', name: 'Ada Lovelace' }} size='lg' />)

		expect(container.querySelector('[data-slot="avatar"]')).toHaveAttribute('data-size', 'lg')
	})

	it('applies a custom className to the avatar', () => {
		const { container } = render(<MemberAvatar member={{ id: 'u1', name: 'Ada Lovelace' }} className='custom-class' />)

		expect(container.querySelector('[data-slot="avatar"]')).toHaveClass('custom-class')
	})
})
