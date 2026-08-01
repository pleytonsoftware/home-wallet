import type { UpdateHouseholdSettingsInput } from '@lib/schemas/household/update-household-settings'

import { updateHouseholdSettings } from '@actions/household/update-settings'

import { updateHouseholdSettingsMutationOptions } from './update-household-settings.hook'

vi.mock('@actions/household/update-settings', () => ({
	updateHouseholdSettings: vi.fn(),
}))

type MutationFn = (input: UpdateHouseholdSettingsInput) => Promise<unknown>

const OK_RESULT = { status: 200, success: true, data: { id: 'h1' } } as const

const INPUT = {
	name: 'Home',
	currency: 'USD',
	splitStrategy: 'equal',
	autoCategorize: true,
	aiAssistEnabled: false,
	fullAddress: '',
} as unknown as UpdateHouseholdSettingsInput

describe('updateHouseholdSettingsMutationOptions', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('builds a mutationFn that calls the action with the household id and input', async () => {
		vi.mocked(updateHouseholdSettings).mockResolvedValue(OK_RESULT)

		const options = updateHouseholdSettingsMutationOptions('h1')
		await expect((options.mutationFn as MutationFn)(INPUT)).resolves.toBe(OK_RESULT)

		expect(updateHouseholdSettings).toHaveBeenCalledWith('h1', INPUT)
	})

	it('forwards the household id it was created with', async () => {
		vi.mocked(updateHouseholdSettings).mockResolvedValue(OK_RESULT)

		const options = updateHouseholdSettingsMutationOptions('other')
		await (options.mutationFn as MutationFn)(INPUT)

		expect(updateHouseholdSettings).toHaveBeenCalledWith('other', INPUT)
	})

	it('spreads through additional options such as callbacks', () => {
		const onSuccess = vi.fn()
		const onError = vi.fn()

		const options = updateHouseholdSettingsMutationOptions('h1', { onSuccess, onError })

		expect(options.onSuccess).toBe(onSuccess)
		expect(options.onError).toBe(onError)
		expect(options.mutationFn).toBeTypeOf('function')
	})
})
