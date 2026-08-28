import { withOwnedResource } from './owned-resource'

describe('withOwnedResource', () => {
	it('calls next with the loaded resource when the loader resolves it', async () => {
		const resource = { householdId: 'h1', householdMemberId: 'm1' }
		const loader = vi.fn().mockResolvedValue(resource)
		const next = vi.fn().mockReturnValue({ ok: true })

		const result = await withOwnedResource(loader)({}, next)

		expect(loader).toHaveBeenCalledWith({})
		expect(next).toHaveBeenCalledWith({ resource })
		expect(result).toEqual({ ok: true })
	})

	it('returns FORBIDDEN and skips next when the loader resolves null', async () => {
		const loader = vi.fn().mockResolvedValue(null)
		const next = vi.fn()

		const result = await withOwnedResource(loader)({}, next)

		expect(next).not.toHaveBeenCalled()
		expect(result).toMatchObject({ status: 403, success: false, error: 'Forbidden' })
	})
})
