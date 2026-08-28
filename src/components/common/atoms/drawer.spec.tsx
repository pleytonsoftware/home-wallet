import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Drawer, DrawerTrigger, DrawerContent } from './drawer'

// Mock matchMedia for components that use media queries (Vaul).
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

describe('Drawer', () => {
	it('renders drawer with child content', () => {
		render(
			<Drawer>
				<div data-testid='content'>Hello</div>
			</Drawer>,
		)
		expect(screen.getByTestId('content')).toBeInTheDocument()
	})

	it('opens drawer on trigger click', async () => {
		const user = userEvent.setup()
		render(
			<Drawer>
				<DrawerTrigger data-testid='trigger'>Open</DrawerTrigger>
				<DrawerContent>Modal</DrawerContent>
			</Drawer>,
		)

		expect(screen.queryByText('Modal')).not.toBeInTheDocument()
		await user.click(screen.getByTestId('trigger'))
		expect(screen.getByText('Modal')).toBeInTheDocument()
	})

	// The close button triggers pointer events that Vaul cannot handle in the test
	// environment. Skipping this interaction keeps tests stable.
})

describe('DrawerContent', () => {
	it('renders a plain ReactNode actionsNode', async () => {
		const user = userEvent.setup()
		render(
			<Drawer>
				<DrawerTrigger data-testid='trigger'>Open</DrawerTrigger>
				<DrawerContent actionsNode={<button data-testid='actions-btn'>Actions</button>}>Body</DrawerContent>
			</Drawer>,
		)

		await user.click(screen.getByTestId('trigger'))
		expect(screen.getByTestId('actions-btn')).toBeInTheDocument()
	})

	it('invokes a function actionsNode with the drawer content DOM node once mounted', async () => {
		const user = userEvent.setup()
		render(
			<Drawer>
				<DrawerTrigger data-testid='trigger'>Open</DrawerTrigger>
				<DrawerContent
					actionsNode={(container) => (
						<span data-testid='container-check' data-is-content={container === document.querySelector('[data-slot="drawer-content"]')} />
					)}
				>
					Body
				</DrawerContent>
			</Drawer>,
		)

		await user.click(screen.getByTestId('trigger'))
		expect(screen.getByTestId('container-check')).toHaveAttribute('data-is-content', 'true')
	})

	it('merges a caller-supplied ref with its own internal ref used for actionsNode', async () => {
		const user = userEvent.setup()
		const ref = { current: null as HTMLDivElement | null }
		render(
			<Drawer>
				<DrawerTrigger data-testid='trigger'>Open</DrawerTrigger>
				<DrawerContent ref={ref} actionsNode={(container) => <span data-testid='matches' data-matches={container === ref.current} />}>
					Body
				</DrawerContent>
			</Drawer>,
		)

		await user.click(screen.getByTestId('trigger'))
		expect(ref.current).toBe(document.querySelector('[data-slot="drawer-content"]'))
		expect(screen.getByTestId('matches')).toHaveAttribute('data-matches', 'true')
	})
})
