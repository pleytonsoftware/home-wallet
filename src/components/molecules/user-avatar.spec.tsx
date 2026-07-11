/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { UserGenderType } from '@/types/auth'

import { getInitials, getRandomUniqueAvatar } from '@lib/utils/avatar'
import { render, screen } from '@testing-library/react'

import { UserAvatar } from './user-avatar'

vi.mock('@atoms/avatar', () => ({
	Avatar: ({ children, ...props }: React.ComponentProps<'div'>) => (
		<div data-testid='avatar' {...props}>
			{children}
		</div>
	),
	AvatarImage: (props: React.ComponentProps<'img'>) => <img data-testid='avatar-image' {...props} />,
	AvatarFallback: ({ children, ...props }: React.ComponentProps<'span'>) => (
		<span data-testid='avatar-fallback' {...props}>
			{children}
		</span>
	),
}))

describe('UserAvatar', () => {
	it('renders the Avatar with the expected sizing classes', () => {
		render(<UserAvatar user={{ name: 'Jane Doe', email: 'jane@example.com', image: null }} />)
		expect(screen.getByTestId('avatar')).toHaveClass('h-8 w-8 rounded-full')
	})

	it('uses the provided image as the src', () => {
		render(<UserAvatar user={{ name: 'Jane Doe', email: 'jane@example.com', image: 'https://cdn.example.com/jane.png' }} />)
		expect(screen.getByTestId('avatar-image')).toHaveAttribute('src', 'https://cdn.example.com/jane.png')
	})

	it('falls back to a generated avatar url when image is null', () => {
		render(<UserAvatar user={{ name: 'Jane Doe', email: 'jane@example.com', image: null }} />)
		expect(screen.getByTestId('avatar-image')).toHaveAttribute('src', getRandomUniqueAvatar('jane@example.com'))
	})

	it('passes the gender through to the generated avatar url', () => {
		render(<UserAvatar user={{ name: 'John Doe', email: 'john@example.com', image: null, gender: UserGenderType.male }} />)
		expect(screen.getByTestId('avatar-image')).toHaveAttribute('src', getRandomUniqueAvatar('john@example.com', UserGenderType.male))
	})

	it('uses the user name as the alt text', () => {
		render(<UserAvatar user={{ name: 'Jane Doe', email: 'jane@example.com', image: null }} />)
		expect(screen.getByTestId('avatar-image')).toHaveAttribute('alt', 'Jane Doe')
	})

	it('renders the fallback with the initials of the name', () => {
		render(<UserAvatar user={{ name: 'Jane Doe', email: 'jane@example.com', image: null }} />)
		expect(screen.getByTestId('avatar-fallback')).toHaveTextContent(getInitials('Jane Doe'))
	})

	it('renders the fallback with the rounded and uppercase classes', () => {
		render(<UserAvatar user={{ name: 'Jane Doe', email: 'jane@example.com', image: null }} />)
		expect(screen.getByTestId('avatar-fallback')).toHaveClass('rounded-full uppercase')
	})
})
