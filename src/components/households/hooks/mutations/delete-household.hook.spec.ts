import { deleteHousehold } from '@actions/household/danger'

import { deleteHouseholdMutationOptions } from './delete-household.hook'

vi.mock('@actions/household/danger', () => ({
	deleteHousehold: vi.fn(),
}))

type MutationFn = (confirmName: string) => Promise<unknown>

const OK_RESULT = { status: 200, success: true, data: { deleted: true } } as const

describe('deleteHouseholdMutationOptions', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('builds a mutationFn that calls the action with the household id and confirmName', async () => {
		vi.mocked(deleteHousehold).mockResolvedValue(OK_RESULT)

		const options = deleteHouseholdMutationOptions('h1')
		await expect((options.mutationFn as MutationFn)('My House')).resolves.toBe(OK_RESULT)

		expect(deleteHousehold).toHaveBeenCalledWith('h1', 'My House')
	})

	it('forwards the household id it was created with', async () => {
		vi.mocked(deleteHousehold).mockResolvedValue(OK_RESULT)

		const options = deleteHouseholdMutationOptions('other')
		await (options.mutationFn as MutationFn)('Name')

		expect(deleteHousehold).toHaveBeenCalledWith('other', 'Name')
	})

	it('spreads through additional options such as callbacks', () => {
		const onSuccess = vi.fn()
		const onError = vi.fn()

		const options = deleteHouseholdMutationOptions('h1', { onSuccess, onError })

		expect(options.onSuccess).toBe(onSuccess)
		expect(options.onError).toBe(onError)
		expect(options.mutationFn).toBeTypeOf('function')
	})
})
