import { render, screen } from '@testing-library/react'

import { FloatingControls } from './floating-controls'

vi.mock('@molecules/language-selector', () => ({
	LanguageSelector: () => <div data-testid='language-selector'>Language Selector</div>,
}))

describe('FloatingControls', () => {
	it('renders the language selector', () => {
		render(<FloatingControls theme='light' />)
		expect(screen.getByTestId('language-selector')).toBeInTheDocument()
	})

	it('renders with fixed positioning container', () => {
		const { container } = render(<FloatingControls theme='dark' />)
		const wrapper = container.firstChild as HTMLElement
		expect(wrapper).toHaveClass('fixed')
		expect(wrapper).toHaveClass('bottom-4')
		expect(wrapper).toHaveClass('right-4')
	})

	it('renders with hidden on small screens', () => {
		const { container } = render(<FloatingControls theme='light' />)
		const wrapper = container.firstChild as HTMLElement
		expect(wrapper).toHaveClass('hidden')
		expect(wrapper).toHaveClass('md:flex')
	})

	it('renders with flex layout', () => {
		const { container } = render(<FloatingControls theme='light' />)
		const wrapper = container.firstChild as HTMLElement
		expect(wrapper).toHaveClass('items-center')
		expect(wrapper).toHaveClass('gap-2')
	})

	it('renders with z-index', () => {
		const { container } = render(<FloatingControls theme='light' />)
		const wrapper = container.firstChild as HTMLElement
		expect(wrapper).toHaveClass('z-10')
	})

	it('accepts theme prop', () => {
		render(<FloatingControls theme='dark' />)
		expect(screen.getByTestId('language-selector')).toBeInTheDocument()
	})
})
