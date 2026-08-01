import type { HouseholdDetail } from '@households/types'

import { SplitStrategy } from '@lib/constants/split-strategy.enum'
import { renderHook } from '@testing-library/react'

import { useUpdateHouseholdSettingsForm } from './use-update-household-settings-form.hook'

// The schema factory takes a translator; the resolver is not exercised here, so a passthrough is enough.
const schemaParams = ((key: string) => key) as never

const HOUSEHOLD = {
	id: 'h1',
	name: 'Home',
	fullAddress: '123 Main St',
	config: {
		currency: 'USD',
		defaultSplitStrategy: SplitStrategy.PROPORTIONAL_TO_INCOME,
		autoCategorize: true,
		aiAssistEnabled: false,
	},
} as HouseholdDetail

describe('useUpdateHouseholdSettingsForm', () => {
	it('maps the household detail into the form default values', () => {
		const { result } = renderHook(() => useUpdateHouseholdSettingsForm(schemaParams, HOUSEHOLD))

		expect(result.current.getValues()).toEqual({
			name: 'Home',
			currency: 'USD',
			splitStrategy: SplitStrategy.PROPORTIONAL_TO_INCOME,
			autoCategorize: true,
			aiAssistEnabled: false,
			fullAddress: '123 Main St',
		})
	})

	it('falls back to an empty string when the household has no full address', () => {
		const { result } = renderHook(() => useUpdateHouseholdSettingsForm(schemaParams, { ...HOUSEHOLD, fullAddress: null }))

		expect(result.current.getValues('fullAddress')).toBe('')
	})

	it('is not disabled by default', () => {
		const { result } = renderHook(() => useUpdateHouseholdSettingsForm(schemaParams, HOUSEHOLD))

		expect(result.current.control._options.disabled).toBeUndefined()
	})

	it('disables the form when read-only', () => {
		const { result } = renderHook(() => useUpdateHouseholdSettingsForm(schemaParams, HOUSEHOLD, true))

		expect(result.current.control._options.disabled).toBe(true)
	})
})
