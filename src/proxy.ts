import type { NextRequest, ProxyConfig } from 'next/server'

import { getToken } from 'next-auth/jwt'
import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'

const intlMiddleware = createMiddleware(routing)

const PUBLIC_ROUTES = ['/', '/signin', '/auth', '/api/auth']

export default async function proxy(request: NextRequest) {
	const pathname = request.nextUrl.pathname

	const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.includes(route))

	if (isPublicRoute) {
		return intlMiddleware(request)
	}

	const token = await getToken({ req: request })
	if (!token) {
		// Redirect to signin if no token
		const signInUrl = new URL('/signin', request.nextUrl.origin)
		signInUrl.searchParams.set('callbackUrl', pathname)
		return new Response(null, {
			status: 307,
			headers: { Location: signInUrl.toString() },
		})
	}

	return intlMiddleware(request)
}

export const config = {
	matcher: [
		// Match all pathnames except for
		// - … if they start with `/api`, `/trpc`, `/_next` or `/_vercel`
		// - … the ones containing a dot (e.g. `favicon.ico`)
		'/((?!api|trpc|_next|_vercel|.*\\..*).*)',
	],
} satisfies ProxyConfig
