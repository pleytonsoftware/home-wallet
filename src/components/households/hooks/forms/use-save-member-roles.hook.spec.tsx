import type { HouseholdDetail } from '@households/types'
import type { PropsWithChildren } from 'react'
import type { UseFormReturn } from 'react-hook-form'

import { useRouter } from '@/i18n/navigation'

import { updateMemberRoles } from '@actions/household/update-member-roles'
import { HOUSEHOLDS_QUERY_KEYS } from '@households/constants/query-keys'
import { MemberRole } from '@lib/constants/role.enum'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'

import { useSaveMemberRoles } from './use-save-member-roles.hook'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('@/i18n/navigation', () => ({
	useRouter: vi.fn(),
}))

vi.mock('@actions/household/update-member-roles', () => ({
	updateMemberRoles: vi.fn(),
}))

vi.mock('@lib/logger', () => ({
	logger: { error: vi.fn() },
}))

const refresh = vi.fn()

const HOUSEHOLD = { id: 'h1', name: 'Home' } as HouseholdDetail

interface RolesFormValues {
	assignments: Record<string, MemberRole>
}

const ASSIGNMENTS: Record<string, MemberRole> = { m1: MemberRole.ADMIN, m2: MemberRole.MEMBER }

function createForm(overrides?: Partial<UseFormReturn<RolesFormValues>>) {
	return {
		reset: vi.fn(),
		setError: vi.fn(),
		formState: { errors: {} },
		...overrides,
	} as unknown as UseFormReturn<RolesFormValues>
}

function makeWrapper() {
	const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
	const invalidateQueries = vi.spyOn(queryClient, 'invalidateQueries').mockResolvedValue(undefined)
	const wrapper = ({ children }: PropsWithChildren) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	return { wrapper, invalidateQueries }
}

describe('useSaveMemberRoles', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(useRouter).mockReturnValue({ refresh } as unknown as ReturnType<typeof useRouter>)
	})

	describe('on success', () => {
		it('invalidates the household and households queries, resets the form, and refreshes', async () => {
			vi.mocked(updateMemberRoles).mockResolvedValue({ status: 200, success: true, data: { updated: 1 } })
			const form = createForm()
			const { wrapper, invalidateQueries } = makeWrapper()

			const { result } = renderHook(() => useSaveMemberRoles(HOUSEHOLD, form), { wrapper })

			await act(async () => {
				await result.current.mutateAsync(ASSIGNMENTS)
			})

			expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: HOUSEHOLDS_QUERY_KEYS.household('h1') })
			expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: HOUSEHOLDS_QUERY_KEYS.households, exact: true })
			expect(form.reset).toHaveBeenCalledWith({ assignments: ASSIGNMENTS })
			expect(refresh).toHaveBeenCalledTimes(1)
			expect(form.setError).not.toHaveBeenCalled()
		})
	})

	describe('on a server error result', () => {
		it('applies a string error to the root and rejects', async () => {
			vi.mocked(updateMemberRoles).mockResolvedValue({ status: 400, success: false, error: 'last admin' })
			const form = createForm()
			const { wrapper, invalidateQueries } = makeWrapper()

			const { result } = renderHook(() => useSaveMemberRoles(HOUSEHOLD, form), { wrapper })

			await act(async () => {
				await expect(result.current.mutateAsync(ASSIGNMENTS)).rejects.toThrow()
			})

			expect(form.setError).toHaveBeenCalledWith('root', expect.objectContaining({ message: 'last admin' }))
			expect(invalidateQueries).not.toHaveBeenCalled()
			expect(form.reset).not.toHaveBeenCalled()
			expect(refresh).not.toHaveBeenCalled()
		})
	})

	describe('on a thrown/network error', () => {
		it('sets a root error from the thrown error message', async () => {
			vi.mocked(updateMemberRoles).mockRejectedValue(new Error('network down'))
			const form = createForm()
			const { wrapper } = makeWrapper()

			const { result } = renderHook(() => useSaveMemberRoles(HOUSEHOLD, form), { wrapper })

			await act(async () => {
				await expect(result.current.mutateAsync(ASSIGNMENTS)).rejects.toThrow('network down')
			})

			expect(form.setError).toHaveBeenCalledWith('root', expect.objectContaining({ message: 'network down' }))
		})

		it('does not overwrite an existing root error', async () => {
			vi.mocked(updateMemberRoles).mockRejectedValue(new Error('network down'))
			const form = createForm({ formState: { errors: { root: { message: 'already set' } } } as never })
			const { wrapper } = makeWrapper()

			const { result } = renderHook(() => useSaveMemberRoles(HOUSEHOLD, form), { wrapper })

			await act(async () => {
				await expect(result.current.mutateAsync(ASSIGNMENTS)).rejects.toThrow('network down')
			})

			expect(form.setError).not.toHaveBeenCalled()
		})
	})
})
