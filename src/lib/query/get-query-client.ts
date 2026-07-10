import type { FullErrorResult } from '@lib/errors/types'

import { StatusCodes } from 'http-status-codes'
import { signOut } from 'next-auth/react'

import { ROUTES } from '@lib/constants/routes.const'
import { QueryClient, defaultShouldDehydrateQuery, environmentManager } from '@tanstack/react-query'

// For a full prefetching example, see: https://tanstack.com/query/latest/docs/framework/react/examples/nextjs-app-prefetching
function makeQueryClient() {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
				retry: (failureCount, error) => {
					const errorResult = error as unknown as FullErrorResult

					// Don't retry on 401 errors
					if (errorResult?.status === StatusCodes.UNAUTHORIZED) {
						return false
					}
					return failureCount < 3
				},
			},
			mutations: {
				retry: (failureCount, error) => {
					const errorResult = error as unknown as FullErrorResult
					// Don't retry on 401 errors
					if (errorResult?.status === StatusCodes.UNAUTHORIZED) {
						return false
					}
					return failureCount < 3
				},
				onError: (error) => {
					handleUnauthorizedError(error as unknown as FullErrorResult)
				},
			},
			dehydrate: {
				// include pending queries in dehydration
				shouldDehydrateQuery: (query) => defaultShouldDehydrateQuery(query) || query.state.status === 'pending',
			},
		},
	})
}

/**
 * Handles unauthorized errors by signing the user out and redirecting to sign-in.
 * @param error The FullErrorResult object.
 */
async function handleUnauthorizedError(error: FullErrorResult) {
	if (error?.status === StatusCodes.UNAUTHORIZED) {
		if (environmentManager.isServer()) {
			// This won't be called on the server on mutation, but just in case, we can handle it here.
			const { cookies } = await import('next/headers')
			const { redirect, RedirectType } = await import('next/navigation')

			const cookieStore = await cookies()
			const cookieName = process.env.NEXTAUTH_URL?.startsWith('https') ? '__Secure-next-auth.session-token' : 'next-auth.session-token'
			cookieStore.delete(cookieName)

			redirect(ROUTES.SIGNIN, RedirectType.replace)
		} else {
			await signOut({ callbackUrl: ROUTES.SIGNIN })
		}
	}
}

let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
	if (environmentManager.isServer()) {
		// Server: always make a new query client
		return makeQueryClient()
	} else {
		// Browser: make a new query client if we don't already have one
		// This is very important, so we don't re-make a new client if React
		// suspends during the initial render. This may not be needed if we
		// have a suspense boundary BELOW the creation of the query client
		if (!browserQueryClient) browserQueryClient = makeQueryClient()
		return browserQueryClient
	}
}
