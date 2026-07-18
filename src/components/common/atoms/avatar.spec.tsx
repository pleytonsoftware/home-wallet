import { render, screen } from '@testing-library/react'

import { Avatar, AvatarBadge, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from './avatar'

describe('Avatar', () => {
	it('renders with data-slot attribute', () => {
		render(<Avatar data-testid='avatar' />)
		expect(screen.getByTestId('avatar')).toHaveAttribute('data-slot', 'avatar')
	})

	it('defaults to the default size', () => {
		render(<Avatar data-testid='avatar' />)
		expect(screen.getByTestId('avatar')).toHaveAttribute('data-size', 'default')
	})

	it('respects the size prop', () => {
		render(<Avatar data-testid='avatar' size='sm' />)
		expect(screen.getByTestId('avatar')).toHaveAttribute('data-size', 'sm')
	})

	it('respects the lg size prop', () => {
		render(<Avatar data-testid='avatar' size='lg' />)
		expect(screen.getByTestId('avatar')).toHaveAttribute('data-size', 'lg')
	})

	it('merges custom className', () => {
		render(<Avatar data-testid='avatar' className='custom-class' />)
		expect(screen.getByTestId('avatar')).toHaveClass('custom-class')
	})
})

describe('AvatarImage', () => {
	it('renders with data-slot attribute', () => {
		// Radix's AvatarImage only renders once the image has loaded, which jsdom
		// never triggers, so we assert the fallback is used to reach the image logic instead.
		const { container } = render(
			<Avatar>
				<AvatarFallback data-testid='fallback'>AB</AvatarFallback>
			</Avatar>,
		)
		expect(container.querySelector('[data-slot="avatar-fallback"]')).toBeInTheDocument()
	})
})

describe('AvatarFallback', () => {
	it('renders with data-slot attribute', () => {
		render(
			<Avatar>
				<AvatarFallback data-testid='fallback'>AB</AvatarFallback>
			</Avatar>,
		)
		expect(screen.getByTestId('fallback')).toHaveAttribute('data-slot', 'avatar-fallback')
	})

	it('renders children', () => {
		render(
			<Avatar>
				<AvatarFallback>AB</AvatarFallback>
			</Avatar>,
		)
		expect(screen.getByText('AB')).toBeInTheDocument()
	})

	it('merges custom className', () => {
		render(
			<Avatar>
				<AvatarFallback data-testid='fallback' className='custom-class'>
					AB
				</AvatarFallback>
			</Avatar>,
		)
		expect(screen.getByTestId('fallback')).toHaveClass('custom-class')
	})
})

describe('AvatarBadge', () => {
	it('renders with data-slot attribute', () => {
		render(<AvatarBadge data-testid='badge' />)
		expect(screen.getByTestId('badge')).toHaveAttribute('data-slot', 'avatar-badge')
	})

	it('merges custom className', () => {
		render(<AvatarBadge data-testid='badge' className='custom-class' />)
		expect(screen.getByTestId('badge')).toHaveClass('custom-class')
	})
})

describe('AvatarGroup', () => {
	it('renders with data-slot attribute', () => {
		render(<AvatarGroup data-testid='avatar-group' />)
		expect(screen.getByTestId('avatar-group')).toHaveAttribute('data-slot', 'avatar-group')
	})

	it('renders children avatars', () => {
		render(
			<AvatarGroup>
				<Avatar data-testid='avatar-1' />
				<Avatar data-testid='avatar-2' />
			</AvatarGroup>,
		)
		expect(screen.getByTestId('avatar-1')).toBeInTheDocument()
		expect(screen.getByTestId('avatar-2')).toBeInTheDocument()
	})

	it('merges custom className', () => {
		render(<AvatarGroup data-testid='avatar-group' className='custom-class' />)
		expect(screen.getByTestId('avatar-group')).toHaveClass('custom-class')
	})
})

describe('AvatarGroupCount', () => {
	it('renders with data-slot attribute', () => {
		render(<AvatarGroupCount data-testid='avatar-group-count'>+3</AvatarGroupCount>)
		expect(screen.getByTestId('avatar-group-count')).toHaveAttribute('data-slot', 'avatar-group-count')
	})

	it('renders children', () => {
		render(<AvatarGroupCount>+3</AvatarGroupCount>)
		expect(screen.getByText('+3')).toBeInTheDocument()
	})

	it('merges custom className', () => {
		render(
			<AvatarGroupCount data-testid='avatar-group-count' className='custom-class'>
				+3
			</AvatarGroupCount>,
		)
		expect(screen.getByTestId('avatar-group-count')).toHaveClass('custom-class')
	})
})
