import { render, screen } from '@testing-library/react'

import { LanguageSelector } from './language-selector'

vi.mock('@hooks/use-language', () => ({
	useLanguage: vi.fn(() => 'en'),
}))

vi.mock('@navigation', () => ({
	usePathname: vi.fn(() => '/dashboard'),
}))

vi.mock('next/navigation', () => ({
	useSearchParams: vi.fn(() => new URLSearchParams('tab=settings')),
}))

vi.mock('@atoms/button', () => ({
	Button: ({ children, ...props }: React.ComponentProps<'button'>) => <button {...props}>{children}</button>,
}))

vi.mock('@atoms/dropdown-menu', () => ({
	DropdownMenu: ({ children }: { children: React.ReactNode }) => <div data-slot='dropdown-menu'>{children}</div>,
	DropdownMenuTrigger: ({ children, ...props }: React.ComponentProps<'div'>) => (
		<div data-slot='dropdown-menu-trigger' {...props}>
			{children}
		</div>
	),
	DropdownMenuContent: ({ children, ...props }: React.ComponentProps<'div'>) => (
		<div data-slot='dropdown-menu-content' {...props}>
			{children}
		</div>
	),
	DropdownMenuRadioGroup: ({ children, ...props }: React.ComponentProps<'div'>) => (
		<div data-slot='dropdown-menu-radio-group' role='radiogroup' {...props}>
			{children}
		</div>
	),
}))

vi.mock('./language-selector-item', () => ({
	LanguageSelectorItem: ({ lang }: { lang: string }) => <div data-testid={`lang-item-${lang}`}>{lang}</div>,
}))

describe('LanguageSelector', () => {
	it('renders the trigger button with current language name', () => {
		render(<LanguageSelector />)
		expect(screen.getByText('English')).toBeInTheDocument()
	})

	it('renders the dropdown menu structure', () => {
		render(<LanguageSelector />)
		expect(screen.getByText('English').closest('[data-slot="dropdown-menu"]')).toBeInTheDocument()
	})

	it('renders a language selector item for each available language', () => {
		render(<LanguageSelector />)
		expect(screen.getByTestId('lang-item-en')).toBeInTheDocument()
		expect(screen.getByTestId('lang-item-es')).toBeInTheDocument()
	})

	it('sets the current language as the radio group value', () => {
		render(<LanguageSelector />)
		const radioGroup = screen.getByRole('radiogroup')
		expect(radioGroup).toHaveAttribute('value', 'en')
	})

	it('renders the trigger as a button', () => {
		render(<LanguageSelector />)
		expect(screen.getByRole('button')).toBeInTheDocument()
	})
})
