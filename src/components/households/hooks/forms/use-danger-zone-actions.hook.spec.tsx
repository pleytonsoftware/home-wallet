import type { HouseholdDetail } from '@households/types'
import type { PropsWithChildren } from 'react'

import { useRouter } from '@/i18n/navigation'

import { deleteHousehold, leaveHousehold, regenerateInviteCode } from '@actions/household/danger'
import { HOUSEHOLDS_QUERY_KEYS } from '@households/constants/query-keys'
import { ROUTES } from '@lib/constants/routes.const'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'

import { useDangerZoneActions } from './use-danger-zone-actions.hook'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('@/i18n/navigation', () => ({
	useRouter: vi.fn(),
}))

vi.mock('@actions/household/danger', () => ({
	regenerateInviteCode: vi.fn(),
	leaveHousehold: vi.fn(),
	deleteHousehold: vi.fn(),
}))

vi.mock('@lib/logger', () => ({
	logger: { error: vi.fn() },
}))

const refresh = vi.fn()
const replace = vi.fn()

const HOUSEHOLD = { id: 'h1', name: 'Home' } as HouseholdDetail

function makeWrapper() {
	const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
	const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined)
	const removeQueries = vi.spyOn(queryClient, 'removeQueries')
	const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	return { wrapper, invalidateQueries, removeQueries }
}

describe('useDangerZoneActions', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(useRouter).mockReturnValue({ refresh, replace } as unknown as ReturnType<typeof useRouter>)
	})

	describe('regenerate', () => {
		it('invalidates queries and refreshes on success', async () => {
			vi.mocked(regenerateInviteCode).mockResolvedValue({ status: 200, success: true, data: { code: 'NEW123' } })
			const { wrapper, invalidateQueries } = makeWrapper()

			const { result } = renderHook(() => useDangerZoneActions(HOUSEHOLD), { wrapper })

			await act(async () => {
				await result.current.regenerate.mutateAsync()
			})

			expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: HOUSEHOLDS_QUERY_KEYS.household('h1') })
			expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: HOUSEHOLDS_QUERY_KEYS.households, exact: true })
			expect(refresh).toHaveBeenCalledTimes(1)
			expect(replace).not.toHaveBeenCalled()
		})

		it('surfaces a server error via mutation.error', async () => {
			vi.mocked(regenerateInviteCode).mockResolvedValue({ status: 403, success: false, error: 'not admin' })
			const { wrapper } = makeWrapper()

			const { result } = renderHook(() => useDangerZoneActions(HOUSEHOLD), { wrapper })

			await act(async () => {
				await expect(result.current.regenerate.mutateAsync()).rejects.toThrow('not admin')
			})

			await waitFor(() => expect(result.current.regenerate.error?.message).toBe('not admin'))
		})

		it('surfaces a thrown/network error via mutation.error', async () => {
			vi.mocked(regenerateInviteCode).mockRejectedValue(new Error('network down'))
			const { wrapper } = makeWrapper()

			const { result } = renderHook(() => useDangerZoneActions(HOUSEHOLD), { wrapper })

			await act(async () => {
				await expect(result.current.regenerate.mutateAsync()).rejects.toThrow('network down')
			})

			await waitFor(() => expect(result.current.regenerate.error?.message).toBe('network down'))
		})
	})

	describe('leave', () => {
		it('drops the household query and invalidates the list on success, without refetching the now-inaccessible household', async () => {
			vi.mocked(leaveHousehold).mockResolvedValue({ status: 200, success: true, data: { left: true } })
			const { wrapper, invalidateQueries, removeQueries } = makeWrapper()

			const { result } = renderHook(() => useDangerZoneActions(HOUSEHOLD), { wrapper })

			await act(async () => {
				await result.current.leave.mutateAsync()
			})

			expect(removeQueries).toHaveBeenCalledWith({ queryKey: HOUSEHOLDS_QUERY_KEYS.household('h1') })
			expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: HOUSEHOLDS_QUERY_KEYS.households, exact: true })
			expect(invalidateQueries).not.toHaveBeenCalledWith({ queryKey: HOUSEHOLDS_QUERY_KEYS.household('h1') })
			expect(replace).toHaveBeenCalledWith(ROUTES.HOUSEHOLDS)
		})

		it('surfaces a server error via mutation.error', async () => {
			vi.mocked(leaveHousehold).mockResolvedValue({ status: 400, success: false, error: 'last admin' })
			const { wrapper } = makeWrapper()

			const { result } = renderHook(() => useDangerZoneActions(HOUSEHOLD), { wrapper })

			await act(async () => {
				await expect(result.current.leave.mutateAsync()).rejects.toThrow('last admin')
			})

			await waitFor(() => expect(result.current.leave.error?.message).toBe('last admin'))
		})
	})

	describe('deleteHousehold', () => {
		it('forwards the confirmName to the action', async () => {
			vi.mocked(deleteHousehold).mockResolvedValue({ status: 200, success: true, data: { deleted: true } })
			const { wrapper } = makeWrapper()

			const { result } = renderHook(() => useDangerZoneActions(HOUSEHOLD), { wrapper })

			await act(async () => {
				await result.current.deleteHousehold.mutateAsync('Home')
			})

			expect(deleteHousehold).toHaveBeenCalledWith('h1', 'Home')
		})

		it('drops the household query and invalidates the list on success, without refetching the now-deleted household', async () => {
			vi.mocked(deleteHousehold).mockResolvedValue({ status: 200, success: true, data: { deleted: true } })
			const { wrapper, invalidateQueries, removeQueries } = makeWrapper()

			const { result } = renderHook(() => useDangerZoneActions(HOUSEHOLD), { wrapper })

			await act(async () => {
				await result.current.deleteHousehold.mutateAsync('Home')
			})

			expect(removeQueries).toHaveBeenCalledWith({ queryKey: HOUSEHOLDS_QUERY_KEYS.household('h1') })
			expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: HOUSEHOLDS_QUERY_KEYS.households, exact: true })
			expect(invalidateQueries).not.toHaveBeenCalledWith({ queryKey: HOUSEHOLDS_QUERY_KEYS.household('h1') })
			expect(replace).toHaveBeenCalledWith(ROUTES.HOUSEHOLDS)
		})

		it('surfaces a server error via mutation.error', async () => {
			vi.mocked(deleteHousehold).mockResolvedValue({ status: 400, success: false, error: 'name mismatch' })
			const { wrapper } = makeWrapper()

			const { result } = renderHook(() => useDangerZoneActions(HOUSEHOLD), { wrapper })

			await act(async () => {
				await expect(result.current.deleteHousehold.mutateAsync('wrong')).rejects.toThrow('name mismatch')
			})

			await waitFor(() => expect(result.current.deleteHousehold.error?.message).toBe('name mismatch'))
		})
	})

	describe('error isolation between actions', () => {
		it('does not leak an error from one mutation into another', async () => {
			vi.mocked(regenerateInviteCode).mockResolvedValue({ status: 403, success: false, error: 'regenerate failed' })
			const { wrapper } = makeWrapper()

			const { result } = renderHook(() => useDangerZoneActions(HOUSEHOLD), { wrapper })

			await act(async () => {
				await expect(result.current.regenerate.mutateAsync()).rejects.toThrow('regenerate failed')
			})

			await waitFor(() => expect(result.current.regenerate.error?.message).toBe('regenerate failed'))
			expect(result.current.leave.error).toBeNull()
			expect(result.current.deleteHousehold.error).toBeNull()
		})
	})
})
