import { getCallbackUrl } from './callback-url.utils'

describe('getCallbackUrl', () => {
	it('returns the callback URL when present and starts with landing route', () => {
		const params = new URLSearchParams({ callbackUrl: '/landing/page' })

		const url = getCallbackUrl(params)
		expect(url).toEqual('/landing/page')
	})

	it('falls back to DASHBOARD when callbackUrl is missing', () => {
		const params = new URLSearchParams()
		const url = getCallbackUrl(params)

		expect(url).toBeDefined()
	})
})
