import { regenerateInviteCode } from '@actions/household/danger'

import { regenerateInviteCodeMutationOptions } from './regenerate-invite-code.hook'

vi.mock('@actions/household/danger', () => ({
	regenerateInviteCode: vi.fn(),
}))

type MutationFn = () => Promise<unknown>

const OK_RESULT = { status: 200, success: true, data: { code: 'ABC123' } } as const

describe('regenerateInviteCodeMutationOptions', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('builds a mutationFn that calls the action with the household id', async () => {
		vi.mocked(regenerateInviteCode).mockResolvedValue(OK_RESULT)

		const options = regenerateInviteCodeMutationOptions('h1')
		await expect((options.mutationFn as MutationFn)()).resolves.toBe(OK_RESULT)

		expect(regenerateInviteCode).toHaveBeenCalledWith('h1')
	})

	it('forwards the household id it was created with', async () => {
		vi.mocked(regenerateInviteCode).mockResolvedValue(OK_RESULT)

		const options = regenerateInviteCodeMutationOptions('other')
		await (options.mutationFn as MutationFn)()

		expect(regenerateInviteCode).toHaveBeenCalledWith('other')
	})

	it('spreads through additional options such as callbacks', () => {
		const onSuccess = vi.fn()
		const onError = vi.fn()

		const options = regenerateInviteCodeMutationOptions('h1', { onSuccess, onError })

		expect(options.onSuccess).toBe(onSuccess)
		expect(options.onError).toBe(onError)
		expect(options.mutationFn).toBeTypeOf('function')
	})
})
