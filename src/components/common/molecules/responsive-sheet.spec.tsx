import { useIsMobile } from '@hooks/use-mobile'
import { render, screen } from '@testing-library/react'

import {
	ResponsiveSheet,
	ResponsiveSheetContent,
	ResponsiveSheetDescription,
	ResponsiveSheetFooter,
	ResponsiveSheetHeader,
	ResponsiveSheetTitle,
	ResponsiveSheetTrigger,
} from './responsive-sheet'

vi.mock('@hooks/use-mobile', () => ({
	useIsMobile: vi.fn(),
}))

// Vaul (Drawer) reads matchMedia internally.
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

describe('ResponsiveSheet + ResponsiveSheetContent', () => {
	it('renders a Sheet, not a Drawer, when not mobile', () => {
		vi.mocked(useIsMobile).mockReturnValue(false)
		render(
			<ResponsiveSheet open onOpenChange={vi.fn()}>
				<ResponsiveSheetContent>Body</ResponsiveSheetContent>
			</ResponsiveSheet>,
		)

		expect(document.querySelector('[data-slot="sheet-content"]')).toBeInTheDocument()
		expect(document.querySelector('[data-slot="drawer-content"]')).not.toBeInTheDocument()
		expect(screen.getByText('Body')).toBeInTheDocument()
	})

	it('renders a Drawer, not a Sheet, when mobile', () => {
		vi.mocked(useIsMobile).mockReturnValue(true)
		render(
			<ResponsiveSheet open onOpenChange={vi.fn()}>
				<ResponsiveSheetContent>Body</ResponsiveSheetContent>
			</ResponsiveSheet>,
		)

		expect(document.querySelector('[data-slot="drawer-content"]')).toBeInTheDocument()
		expect(document.querySelector('[data-slot="sheet-content"]')).not.toBeInTheDocument()
		expect(screen.getByText('Body')).toBeInTheDocument()
	})
})

describe('ResponsiveSheetTrigger', () => {
	it('renders a SheetTrigger when not mobile', () => {
		vi.mocked(useIsMobile).mockReturnValue(false)
		render(
			<ResponsiveSheet open={false} onOpenChange={vi.fn()}>
				<ResponsiveSheetTrigger>Open</ResponsiveSheetTrigger>
			</ResponsiveSheet>,
		)

		expect(document.querySelector('[data-slot="sheet-trigger"]')).toBeInTheDocument()
		expect(document.querySelector('[data-slot="drawer-trigger"]')).not.toBeInTheDocument()
	})

	it('renders a DrawerTrigger when mobile', () => {
		vi.mocked(useIsMobile).mockReturnValue(true)
		render(
			<ResponsiveSheet open={false} onOpenChange={vi.fn()}>
				<ResponsiveSheetTrigger>Open</ResponsiveSheetTrigger>
			</ResponsiveSheet>,
		)

		expect(document.querySelector('[data-slot="drawer-trigger"]')).toBeInTheDocument()
		expect(document.querySelector('[data-slot="sheet-trigger"]')).not.toBeInTheDocument()
	})
})

describe('ResponsiveSheetHeader / ResponsiveSheetTitle / ResponsiveSheetDescription', () => {
	it('render the Sheet* variants when not mobile', () => {
		vi.mocked(useIsMobile).mockReturnValue(false)
		render(
			<ResponsiveSheet open onOpenChange={vi.fn()}>
				<ResponsiveSheetContent>
					<ResponsiveSheetHeader>
						<ResponsiveSheetTitle>Title</ResponsiveSheetTitle>
						<ResponsiveSheetDescription>Description</ResponsiveSheetDescription>
					</ResponsiveSheetHeader>
				</ResponsiveSheetContent>
			</ResponsiveSheet>,
		)

		expect(document.querySelector('[data-slot="sheet-header"]')).toBeInTheDocument()
		expect(document.querySelector('[data-slot="sheet-title"]')).toHaveTextContent('Title')
		expect(document.querySelector('[data-slot="sheet-description"]')).toHaveTextContent('Description')
	})

	it('render the Drawer* variants when mobile', () => {
		vi.mocked(useIsMobile).mockReturnValue(true)
		render(
			<ResponsiveSheet open onOpenChange={vi.fn()}>
				<ResponsiveSheetContent>
					<ResponsiveSheetHeader>
						<ResponsiveSheetTitle>Title</ResponsiveSheetTitle>
						<ResponsiveSheetDescription>Description</ResponsiveSheetDescription>
					</ResponsiveSheetHeader>
				</ResponsiveSheetContent>
			</ResponsiveSheet>,
		)

		expect(document.querySelector('[data-slot="drawer-header"]')).toBeInTheDocument()
		expect(document.querySelector('[data-slot="drawer-title"]')).toHaveTextContent('Title')
		expect(document.querySelector('[data-slot="drawer-description"]')).toHaveTextContent('Description')
	})
})

describe('ResponsiveSheetFooter', () => {
	it('renders the SheetFooter variant when not mobile', () => {
		vi.mocked(useIsMobile).mockReturnValue(false)
		render(
			<ResponsiveSheet open onOpenChange={vi.fn()}>
				<ResponsiveSheetContent>
					<ResponsiveSheetFooter>Footer</ResponsiveSheetFooter>
				</ResponsiveSheetContent>
			</ResponsiveSheet>,
		)

		expect(document.querySelector('[data-slot="sheet-footer"]')).toHaveTextContent('Footer')
		expect(document.querySelector('[data-slot="drawer-footer"]')).not.toBeInTheDocument()
	})

	it('renders the DrawerFooter variant when mobile', () => {
		vi.mocked(useIsMobile).mockReturnValue(true)
		render(
			<ResponsiveSheet open onOpenChange={vi.fn()}>
				<ResponsiveSheetContent>
					<ResponsiveSheetFooter>Footer</ResponsiveSheetFooter>
				</ResponsiveSheetContent>
			</ResponsiveSheet>,
		)

		expect(document.querySelector('[data-slot="drawer-footer"]')).toHaveTextContent('Footer')
		expect(document.querySelector('[data-slot="sheet-footer"]')).not.toBeInTheDocument()
	})
})

describe('ResponsiveSheetContent actionsNode', () => {
	it('reaches the rendered surface and receives its container when not mobile', () => {
		vi.mocked(useIsMobile).mockReturnValue(false)
		render(
			<ResponsiveSheet open onOpenChange={vi.fn()}>
				<ResponsiveSheetContent
					actionsNode={(container) => (
						<span data-testid='actions' data-is-content={container === document.querySelector('[data-slot="sheet-content"]')} />
					)}
				>
					Body
				</ResponsiveSheetContent>
			</ResponsiveSheet>,
		)

		expect(screen.getByTestId('actions')).toHaveAttribute('data-is-content', 'true')
	})

	it('reaches the rendered surface and receives its container when mobile', () => {
		vi.mocked(useIsMobile).mockReturnValue(true)
		render(
			<ResponsiveSheet open onOpenChange={vi.fn()}>
				<ResponsiveSheetContent
					actionsNode={(container) => (
						<span data-testid='actions' data-is-content={container === document.querySelector('[data-slot="drawer-content"]')} />
					)}
				>
					Body
				</ResponsiveSheetContent>
			</ResponsiveSheet>,
		)

		expect(screen.getByTestId('actions')).toHaveAttribute('data-is-content', 'true')
	})
})
