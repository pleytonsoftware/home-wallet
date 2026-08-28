import { renderHook } from '@testing-library/react'

import { useCategoryDisplayName } from './use-category-display-name.hook'

const KNOWN_TRANSLATIONS: Record<string, string> = {
	groceries: 'Comestibles',
	income: 'Ingreso',
}

vi.mock('next-intl', () => ({
	useTranslations: () => {
		const t = (key: string) => KNOWN_TRANSLATIONS[key] ?? key
		t.has = (key: string) => key in KNOWN_TRANSLATIONS
		return t
	},
}))

describe('useCategoryDisplayName', () => {
	it('returns the raw name for a non-base (household-created) category', () => {
		const { result } = renderHook(() => useCategoryDisplayName())
		expect(result.current({ name: 'My Custom Category', isBase: false })).toBe('My Custom Category')
	})

	it('returns the translated name for a base category with a known slug', () => {
		const { result } = renderHook(() => useCategoryDisplayName())
		expect(result.current({ name: 'Groceries', isBase: true })).toBe('Comestibles')
		expect(result.current({ name: 'Income', isBase: true })).toBe('Ingreso')
	})

	it('slugifies multi-word names before lookup', () => {
		const { result } = renderHook(() => useCategoryDisplayName())
		expect(result.current({ name: 'income', isBase: true })).toBe('Ingreso')
	})

	it('falls back to the raw name when a base category has no matching translation key', () => {
		const { result } = renderHook(() => useCategoryDisplayName())
		expect(result.current({ name: 'Some New Base Category', isBase: true })).toBe('Some New Base Category')
	})
})
