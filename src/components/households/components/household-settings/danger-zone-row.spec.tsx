import { render, screen } from '@testing-library/react'

import { DangerZoneRow } from './danger-zone-row'

describe('DangerZoneRow', () => {
	it('renders the label and description', () => {
		render(<DangerZoneRow label='Regenerate code' description='Creates a new code' action={<button>Go</button>} />)
		expect(screen.getByText('Regenerate code')).toBeInTheDocument()
		expect(screen.getByText('Creates a new code')).toBeInTheDocument()
	})

	it('renders the action', () => {
		render(<DangerZoneRow label='Regenerate code' description='Creates a new code' action={<button>Go</button>} />)
		expect(screen.getByRole('button', { name: 'Go' })).toBeInTheDocument()
	})

	it('renders children as extra content', () => {
		render(
			<DangerZoneRow label='Regenerate code' description='Creates a new code' action={<button>Go</button>}>
				<p>ABC123</p>
			</DangerZoneRow>,
		)
		expect(screen.getByText('ABC123')).toBeInTheDocument()
	})

	it('shows the error when provided', () => {
		render(<DangerZoneRow label='Leave' description='desc' action={<button>Go</button>} error='Something failed' />)
		expect(screen.getByText('Something failed')).toBeInTheDocument()
	})

	it('does not render an error when omitted', () => {
		const { container } = render(<DangerZoneRow label='Leave' description='desc' action={<button>Go</button>} />)
		expect(container.querySelector('[data-slot="field-error"]')).not.toBeInTheDocument()
	})

	it('does not apply a top border by default', () => {
		const { container } = render(<DangerZoneRow label='Leave' description='desc' action={<button>Go</button>} />)
		expect(container.firstChild).not.toHaveClass('border-t')
	})
})
