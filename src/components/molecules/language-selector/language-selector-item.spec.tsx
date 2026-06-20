import { render, screen } from '@testing-library/react'

import { LanguageSelectorItem } from './language-selector-item'

vi.mock('@/assets/flags', () => ({
	AVAILABLE_LANGUAGE_FLAGS_DICTIONARY: {
		en: (props: React.ComponentProps<'svg'>) => <svg data-testid='flag-en' {...props} />,
		es: (props: React.ComponentProps<'svg'>) => <svg data-testid='flag-es' {...props} />,
	},
}))

const mockRedirect = vi.fn()

vi.mock('@navigation', () => ({
	redirect: (...args: unknown[]) => mockRedirect(...args),
}))

vi.mock('@atoms/dropdown-menu', () => ({
	DropdownMenuRadioItem: ({ children, value, onClick, ...props }: React.ComponentProps<'div'> & { value?: string }) => (
		<div data-slot='dropdown-menu-radio-item' data-value={value} onClick={onClick} {...props}>
			{children}
		</div>
	),
}))

vi.mock('@atoms/icon', () => ({
	Icon: ({ IconComponent: _IconComponent, ...props }: { IconComponent?: React.ComponentType } & React.ComponentProps<'svg'>) => (
		<svg data-testid='icon' {...props} />
	),
}))

vi.mock('lucide-react', () => ({
	Globe: (props: React.ComponentProps<'svg'>) => <svg data-testid='globe-icon' {...props} />,
}))

describe('LanguageSelectorItem', () => {
	beforeEach(() => {
		mockRedirect.mockClear()
	})

	it('renders the language name', () => {
		render(<LanguageSelectorItem lang='en' path='/home' params={new URLSearchParams()} />)
		expect(screen.getByText('English')).toBeInTheDocument()
	})

	it('renders Spanish language name', () => {
		render(<LanguageSelectorItem lang='es' path='/home' params={new URLSearchParams()} />)
		expect(screen.getByText('Español')).toBeInTheDocument()
	})

	it('sets the correct value on the radio item', () => {
		render(<LanguageSelectorItem lang='en' path='/home' params={new URLSearchParams()} />)
		expect(screen.getByText('English').closest('[data-value]')).toHaveAttribute('data-value', 'en')
	})

	it('renders the flag icon for available languages', () => {
		render(<LanguageSelectorItem lang='en' path='/home' params={new URLSearchParams()} />)
		expect(screen.getByTestId('flag-en')).toBeInTheDocument()
	})

	it('calls redirect on click with correct params', () => {
		const params = new URLSearchParams({ tab: 'settings' })
		render(<LanguageSelectorItem lang='es' path='/dashboard' params={params} />)

		screen.getByText('Español').click()

		expect(mockRedirect).toHaveBeenCalledWith({
			href: {
				pathname: '/dashboard',
				query: { tab: 'settings' },
			},
			locale: 'es',
		})
	})

	it('calls redirect with empty query when no params', () => {
		render(<LanguageSelectorItem lang='en' path='/home' params={new URLSearchParams()} />)

		screen.getByText('English').click()

		expect(mockRedirect).toHaveBeenCalledWith({
			href: {
				pathname: '/home',
				query: {},
			},
			locale: 'en',
		})
	})
})
