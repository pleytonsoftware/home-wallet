import { updateMemberRoles } from '@actions/household/update-member-roles'
import { MemberRole } from '@lib/constants/role.enum'

import { updateMemberRolesMutationOptions } from './update-member-roles.hook'

vi.mock('@actions/household/update-member-roles', () => ({
	updateMemberRoles: vi.fn(),
}))

type MutationFn = (input: Record<string, MemberRole>) => Promise<unknown>

const INPUT: Record<string, MemberRole> = { m1: MemberRole.ADMIN, m2: MemberRole.MEMBER }
const OK_RESULT = { status: 200, success: true, data: { updated: 1 } } as const

describe('updateMemberRolesMutationOptions', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('builds a mutationFn that calls the action with the household id and input', async () => {
		vi.mocked(updateMemberRoles).mockResolvedValue(OK_RESULT)

		const options = updateMemberRolesMutationOptions('h1')
		await expect((options.mutationFn as MutationFn)(INPUT)).resolves.toBe(OK_RESULT)

		expect(updateMemberRoles).toHaveBeenCalledWith('h1', INPUT)
	})

	it('forwards the household id it was created with', async () => {
		vi.mocked(updateMemberRoles).mockResolvedValue(OK_RESULT)

		const options = updateMemberRolesMutationOptions('other')
		await (options.mutationFn as MutationFn)(INPUT)

		expect(updateMemberRoles).toHaveBeenCalledWith('other', INPUT)
	})

	it('spreads through additional options such as callbacks', () => {
		const onSuccess = vi.fn()
		const onError = vi.fn()

		const options = updateMemberRolesMutationOptions('h1', { onSuccess, onError })

		expect(options.onSuccess).toBe(onSuccess)
		expect(options.onError).toBe(onError)
		expect(options.mutationFn).toBeTypeOf('function')
	})
})
