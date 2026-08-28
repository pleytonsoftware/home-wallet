import { authorizedSession } from '@lib/auth/utils'

import { withAuthorizedSession } from './authorized-session'

vi.mock('@lib/auth/utils', () => ({
	authorizedSession: vi.fn(),
}))

describe('withAuthorizedSession', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('calls next with the session when authorized', async () => {
		const session = { user: { id: 'u1' } }
		vi.mocked(authorizedSession).mockResolvedValue({ session, error: null } as never)
		const next = vi.fn().mockReturnValue({ ok: true })

		const result = await withAuthorizedSession({}, next)

		expect(next).toHaveBeenCalledWith({ session })
		expect(result).toEqual({ ok: true })
	})

	it('returns the unauthorized error and skips next when unauthenticated', async () => {
		const error = { status: 401, success: false, error: 'Unauthorized' }
		vi.mocked(authorizedSession).mockResolvedValue({ session: null, error } as never)
		const next = vi.fn()

		const result = await withAuthorizedSession({}, next)

		expect(next).not.toHaveBeenCalled()
		expect(result).toEqual(error)
	})
})
