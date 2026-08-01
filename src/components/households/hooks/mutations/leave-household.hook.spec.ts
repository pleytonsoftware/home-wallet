import { leaveHousehold } from '@actions/household/danger'

import { leaveHouseholdMutationOptions } from './leave-household.hook'

vi.mock('@actions/household/danger', () => ({
	leaveHousehold: vi.fn(),
}))

type MutationFn = () => Promise<unknown>

const OK_RESULT = { status: 200, success: true, data: { left: true } } as const

describe('leaveHouseholdMutationOptions', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('builds a mutationFn that calls the action with the household id', async () => {
		vi.mocked(leaveHousehold).mockResolvedValue(OK_RESULT)

		const options = leaveHouseholdMutationOptions('h1')
		await expect((options.mutationFn as MutationFn)()).resolves.toBe(OK_RESULT)

		expect(leaveHousehold).toHaveBeenCalledWith('h1')
	})

	it('forwards the household id it was created with', async () => {
		vi.mocked(leaveHousehold).mockResolvedValue(OK_RESULT)

		const options = leaveHouseholdMutationOptions('other')
		await (options.mutationFn as MutationFn)()

		expect(leaveHousehold).toHaveBeenCalledWith('other')
	})

	it('spreads through additional options such as callbacks', () => {
		const onSuccess = vi.fn()
		const onError = vi.fn()

		const options = leaveHouseholdMutationOptions('h1', { onSuccess, onError })

		expect(options.onSuccess).toBe(onSuccess)
		expect(options.onError).toBe(onError)
		expect(options.mutationFn).toBeTypeOf('function')
	})
})
