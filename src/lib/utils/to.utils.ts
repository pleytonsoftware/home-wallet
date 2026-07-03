/**
 * Wraps a promise to return a tuple instead of throwing errors.
 *
 * This utility function converts promise rejections into return values,
 * eliminating the need for try-catch blocks when handling async operations.
 *
 * @template T - The type of the resolved promise value
 * @template E - The type of the error (defaults to Error)
 *
 * @param promise - The promise to wrap
 *
 * @returns A promise that resolves to a tuple:
 *   - `[error, undefined]` if the promise rejects
 *   - `[null, data]` if the promise resolves successfully
 *
 * @example
 * ```typescript
 * const [error, data] = await to(fetchUser(id));
 * if (error) {
 *   logError('Failed to fetch user:', error);
 *   return;
 * }
 * logInfo('User data:', data);
 * ```
 */
export async function to<T, E = Error>(promise: Promise<T>): Promise<[E, undefined] | [null, T]> {
	try {
		const data = await promise
		return [null, data]
	} catch (error) {
		return [error as E, undefined]
	}
}
