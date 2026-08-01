import type { HouseholdDetail } from '@households/types'
import type { UpdateHouseholdSettingsInput } from '@lib/schemas/household/update-household-settings'
import type { PropsWithChildren } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { useRouter } from '@/i18n/navigation'

import { updateHouseholdSettings } from '@actions/household/update-settings'
import { HOUSEHOLDS_QUERY_KEYS } from '@households/constants/query-keys'
import { SplitStrategy } from '@lib/constants/split-strategy.enum'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'

import { useGeneralSettingsSubmit } from './use-general-settings-submit.hook'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('@/i18n/navigation', () => ({
	useRouter: vi.fn(),
}))

vi.mock('@actions/household/update-settings', () => ({
	updateHouseholdSettings: vi.fn(),
}))

vi.mock('@lib/logger', () => ({
	logger: { error: vi.fn() },
}))

const refresh = vi.fn()

const HOUSEHOLD = { id: 'h1', name: 'Home' } as HouseholdDetail

const INPUT = {
	name: 'Updated',
	currency: 'USD',
	splitStrategy: SplitStrategy.EQUAL,
	autoCategorize: true,
	aiAssistEnabled: false,
	fullAddress: '',
} as unknown as UpdateHouseholdSettingsInput

function createForm(overrides?: Partial<UseFormReturn<UpdateHouseholdSettingsInput>>) {
	return {
		reset: vi.fn(),
		setError: vi.fn(),
		formState: { errors: {} },
		...overrides,
	} as unknown as UseFormReturn<UpdateHouseholdSettingsInput>
}

function makeWrapper() {
	const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
	const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined)
	const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	return { wrapper, invalidateQueries }
}

describe('useGeneralSettingsSubmit', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(useRouter).mockReturnValue({ refresh } as unknown as ReturnType<typeof useRouter>)
	})

	describe('on success', () => {
		it('invalidates the household and households queries, resets the form and refreshes', async () => {
			vi.mocked(updateHouseholdSettings).mockResolvedValue({ status: 200, success: true, data: { id: 'h1' } })
			const form = createForm()
			const { wrapper, invalidateQueries } = makeWrapper()

			const { result } = renderHook(() => useGeneralSettingsSubmit(HOUSEHOLD, form), { wrapper })

			await act(async () => {
				await result.current.mutateAsync(INPUT)
			})

			expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: HOUSEHOLDS_QUERY_KEYS.household('h1') })
			expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: HOUSEHOLDS_QUERY_KEYS.households, exact: true })
			expect(form.reset).toHaveBeenCalledWith(INPUT)
			expect(refresh).toHaveBeenCalledTimes(1)
			expect(form.setError).not.toHaveBeenCalled()
		})
	})

	describe('on a server error result', () => {
		it('applies a string error to the root and rejects', async () => {
			vi.mocked(updateHouseholdSettings).mockResolvedValue({ status: 400, success: false, error: 'boom' })
			const form = createForm()
			const { wrapper, invalidateQueries } = makeWrapper()

			const { result } = renderHook(() => useGeneralSettingsSubmit(HOUSEHOLD, form), { wrapper })

			await act(async () => {
				await expect(result.current.mutateAsync(INPUT)).rejects.toThrow()
			})

			expect(form.setError).toHaveBeenCalledWith('root', expect.objectContaining({ message: 'boom' }))
			expect(invalidateQueries).not.toHaveBeenCalled()
			expect(form.reset).not.toHaveBeenCalled()
			expect(refresh).not.toHaveBeenCalled()
		})

		it('applies field-level issues to their paths', async () => {
			vi.mocked(updateHouseholdSettings).mockResolvedValue({
				status: 400,
				success: false,
				error: [{ code: 'too_small', path: ['name'], message: 'Name too short' }] as never,
			})
			const form = createForm()
			const { wrapper } = makeWrapper()

			const { result } = renderHook(() => useGeneralSettingsSubmit(HOUSEHOLD, form), { wrapper })

			await act(async () => {
				await expect(result.current.mutateAsync(INPUT)).rejects.toThrow()
			})

			expect(form.setError).toHaveBeenCalledWith('name', expect.objectContaining({ message: 'Name too short' }))
		})
	})

	describe('on a thrown/network error', () => {
		it('sets a root error from the thrown error message', async () => {
			vi.mocked(updateHouseholdSettings).mockRejectedValue(new Error('network down'))
			const form = createForm()
			const { wrapper } = makeWrapper()

			const { result } = renderHook(() => useGeneralSettingsSubmit(HOUSEHOLD, form), { wrapper })

			await act(async () => {
				await expect(result.current.mutateAsync(INPUT)).rejects.toThrow('network down')
			})

			expect(form.setError).toHaveBeenCalledWith('root', expect.objectContaining({ message: 'network down' }))
		})

		it('does not overwrite an existing root error', async () => {
			vi.mocked(updateHouseholdSettings).mockRejectedValue(new Error('network down'))
			const form = createForm({ formState: { errors: { root: { message: 'already set' } } } as never })
			const { wrapper } = makeWrapper()

			const { result } = renderHook(() => useGeneralSettingsSubmit(HOUSEHOLD, form), { wrapper })

			await act(async () => {
				await expect(result.current.mutateAsync(INPUT)).rejects.toThrow('network down')
			})

			expect(form.setError).not.toHaveBeenCalled()
		})
	})
})
