import type { NextRequest, ProxyConfig } from 'next/server'

import { routing } from '@/i18n/routing'

import { getToken } from 'next-auth/jwt'
import createMiddleware from 'next-intl/middleware'

import { ROUTES } from '@lib/constants/routes.const'

const intlMiddleware = createMiddleware(routing)

const LANDING_PATH = ROUTES.LANDING
const SIGNIN_PATH = ROUTES.SIGNIN
const AUTH_PATH = ROUTES.AUTH.ROOT
const API_AUTH_PATH = ROUTES.API_AUTH
const PUBLIC_ROUTES = [LANDING_PATH, SIGNIN_PATH, ROUTES.VERIFY_REQUEST, AUTH_PATH, API_AUTH_PATH] as string[]
const SIGN_IN_AND_AUTH_PATHS = [SIGNIN_PATH, `${AUTH_PATH}/`, API_AUTH_PATH]

function isPublicRoute(pathname: string): boolean {
	const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}(-[a-z]{2})?(\/.*)?$/i, '$2')
	const cleanPath = pathWithoutLocale || LANDING_PATH

	if (PUBLIC_ROUTES.includes(cleanPath)) return true

	for (const route of SIGN_IN_AND_AUTH_PATHS) {
		if (cleanPath.startsWith(route)) return true
	}

	return false
}

export default async function proxy(request: NextRequest) {
	const pathname = request.nextUrl.pathname

	if (isPublicRoute(pathname)) {
		return intlMiddleware(request)
	}

	const token = await getToken({ req: request })
	if (!token) {
		// Redirect to signin if no token
		const signInUrl = new URL(ROUTES.SIGNIN, request.nextUrl.origin)
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
