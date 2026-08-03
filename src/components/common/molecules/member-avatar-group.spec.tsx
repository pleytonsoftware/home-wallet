import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { MemberAvatarGroup } from './member-avatar-group'

const members = [
	{ id: 'u1', name: 'Ada Lovelace' },
	{ id: 'u2', name: 'Bob Marley' },
	{ id: 'u3', name: 'Cid Kagenou' },
	{ id: 'u4', name: 'Dana Scully' },
]

describe('MemberAvatarGroup', () => {
	it('renders every member when there are fewer than the default max', () => {
		render(<MemberAvatarGroup members={members.slice(0, 2)} />)

		expect(screen.getByText('AL')).toBeInTheDocument()
		expect(screen.getByText('BM')).toBeInTheDocument()
		expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
	})

	it('shows only up to the default max (3) members and a +N overflow count', () => {
		render(<MemberAvatarGroup members={members} />)

		expect(screen.getByText('AL')).toBeInTheDocument()
		expect(screen.getByText('BM')).toBeInTheDocument()
		expect(screen.getByText('CK')).toBeInTheDocument()
		expect(screen.queryByText('DS')).not.toBeInTheDocument()
		expect(screen.getByText('+1')).toBeInTheDocument()
	})

	it('respects a custom max prop', () => {
		render(<MemberAvatarGroup members={members} max={2} />)

		expect(screen.getByText('AL')).toBeInTheDocument()
		expect(screen.getByText('BM')).toBeInTheDocument()
		expect(screen.queryByText('CK')).not.toBeInTheDocument()
		expect(screen.getByText('+2')).toBeInTheDocument()
	})

	it('does not show an overflow count when members exactly fill max', () => {
		render(<MemberAvatarGroup members={members.slice(0, 3)} max={3} />)

		expect(screen.queryByText(/^\+/)).not.toBeInTheDocument()
	})

	it('passes the size prop down to each member avatar', () => {
		const { container } = render(<MemberAvatarGroup members={members.slice(0, 1)} size='lg' />)

		expect(container.querySelector('[data-slot="avatar"]')).toHaveAttribute('data-size', 'lg')
	})

	it('defaults to the sm size', () => {
		const { container } = render(<MemberAvatarGroup members={members.slice(0, 1)} />)

		expect(container.querySelector('[data-slot="avatar"]')).toHaveAttribute('data-size', 'sm')
	})

	it('opens a popover with the member name and email when clicking their avatar', async () => {
		const user = userEvent.setup()
		render(<MemberAvatarGroup members={[{ id: 'u1', name: 'Ada Lovelace', email: 'ada@example.com' }]} />)

		await user.click(screen.getByText('AL'))

		expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
		expect(screen.getByText('ada@example.com')).toBeInTheDocument()
	})

	it('omits the email line in the popover when the member has none', async () => {
		const user = userEvent.setup()
		render(<MemberAvatarGroup members={[{ id: 'u1', name: 'Ada Lovelace' }]} />)

		await user.click(screen.getByText('AL'))

		expect(screen.getAllByText('Ada Lovelace')).toHaveLength(1)
	})

	it('opens a popover listing the overflowed members when clicking the +N badge', async () => {
		const user = userEvent.setup()
		render(<MemberAvatarGroup members={[...members, { id: 'u5', name: 'Eve Adams', email: 'eve@example.com' }]} max={3} />)

		await user.click(screen.getByText('+2'))

		expect(screen.getByText('Dana Scully')).toBeInTheDocument()
		expect(screen.getByText('Eve Adams')).toBeInTheDocument()
		expect(screen.getByText('eve@example.com')).toBeInTheDocument()
		// Visible (non-overflowed) members shouldn't leak into the overflow popover.
		expect(screen.queryByText('Ada Lovelace')).not.toBeInTheDocument()
	})

	it('opens the popover on hover, without requiring a click', async () => {
		const user = userEvent.setup()
		render(<MemberAvatarGroup members={[{ id: 'u1', name: 'Ada Lovelace', email: 'ada@example.com' }]} />)

		await user.hover(screen.getByText('AL'))

		expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
		expect(screen.getByText('ada@example.com')).toBeInTheDocument()
	})

	it('opens the +N overflow popover on hover, without requiring a click', async () => {
		const user = userEvent.setup()
		render(<MemberAvatarGroup members={[...members, { id: 'u5', name: 'Eve Adams' }]} max={3} />)

		await user.hover(screen.getByText('+2'))

		expect(await screen.findByText('Dana Scully')).toBeInTheDocument()
		expect(screen.getByText('Eve Adams')).toBeInTheDocument()
	})

	it('does not bubble the click to an ancestor (e.g. a wrapping link/card) when opening via click', async () => {
		const user = userEvent.setup()
		const onAncestorClick = vi.fn()
		render(
			<div onClick={onAncestorClick}>
				<MemberAvatarGroup members={[{ id: 'u1', name: 'Ada Lovelace' }]} />
			</div>,
		)

		await user.click(screen.getByText('AL'))

		expect(await screen.findByText('Ada Lovelace')).toBeInTheDocument()
		expect(onAncestorClick).not.toHaveBeenCalled()
	})
})
