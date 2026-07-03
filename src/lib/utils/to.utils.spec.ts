import { to } from './to.utils'

describe('to', () => {
	it('should return [null, data] when promise resolves', async () => {
		const promise = Promise.resolve({ id: 1, name: 'John' })
		const [error, data] = await to(promise)

		expect(error).toBeNull()
		expect(data).toEqual({ id: 1, name: 'John' })
	})

	it('should return [error, undefined] when promise rejects', async () => {
		const testError = new Error('Test error message')
		const promise = Promise.reject(testError)
		const [error, data] = await to(promise)

		expect(error).toBe(testError)
		expect(data).toBeUndefined()
	})

	it('should handle string rejection', async () => {
		const promise = Promise.reject('String error')
		const [error, data] = await to<never, string>(promise)

		expect(error).toBe('String error')
		expect(data).toBeUndefined()
	})

	it('should handle successful async function', async () => {
		const asyncFunc = async () => {
			return { success: true }
		}
		const [error, data] = await to(asyncFunc())

		expect(error).toBeNull()
		expect(data).toEqual({ success: true })
	})

	it('should handle rejected async function', async () => {
		const asyncFunc = async () => {
			throw new Error('Async error')
		}
		const [error, data] = await to(asyncFunc())

		expect(error).toEqual(new Error('Async error'))
		expect(data).toBeUndefined()
	})
})
