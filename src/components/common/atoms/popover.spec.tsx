import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Popover, PopoverTrigger, PopoverContent } from './popover'

beforeAll(() => {
	Object.defineProperty(window, 'matchMedia', {
		writable: true,
		value: vi.fn().mockImplementation((query) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
		})),
	})
})

describe('Popover', () => {
	it('shows content when trigger clicked', async () => {
		const user = userEvent.setup()
		render(
			<Popover>
				<PopoverTrigger>Open</PopoverTrigger>
				<PopoverContent>Details</PopoverContent>
			</Popover>,
		)
		expect(screen.queryByText('Details')).not.toBeInTheDocument()
		await user.click(screen.getByText('Open'))
		expect(screen.getByText('Details')).toBeInTheDocument()
	})
})
