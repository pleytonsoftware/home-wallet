import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupText, InputGroupInput } from './input-group'

// mock matchMedia for Vaul components if any (none here but safe)
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

describe('InputGroup', () => {
	it('renders with data-slot attribute', () => {
		render(
			<InputGroup>
				<InputGroupInput placeholder='test' />
			</InputGroup>,
		)
		const group = screen.getByRole('group')
		expect(group).toHaveAttribute('data-slot', 'input-group')
	})

	it('focuses input when addon clicked', async () => {
		const user = userEvent.setup()
		render(
			<InputGroup>
				<InputGroupAddon data-testid='addon'>A</InputGroupAddon>
				<InputGroupInput data-testid='input' />
			</InputGroup>,
		)
		const input = screen.getByTestId('input') as HTMLInputElement
		expect(input).not.toHaveFocus()
		await user.click(screen.getByTestId('addon'))
		expect(input).toHaveFocus()
	})

	it('renders button with correct size variant', () => {
		render(
			<InputGroup>
				<InputGroupButton data-testid='btn'>B</InputGroupButton>
				<InputGroupInput placeholder='foo' />
			</InputGroup>,
		)
		const btn = screen.getByTestId('btn')
		expect(btn).toBeInTheDocument()
	})

	it('renders text addon', () => {
		render(
			<InputGroup>
				<InputGroupText data-testid='text'>$</InputGroupText>
				<InputGroupInput placeholder='bar' />
			</InputGroup>,
		)
		const txt = screen.getByTestId('text')
		expect(txt).toHaveTextContent('$')
	})
})
