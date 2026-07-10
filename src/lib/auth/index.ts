import type { NextAuthOptions } from 'next-auth'

import { DEFAULT_LANGUAGE, type Languages } from '@/i18n/languages'

import ms from 'ms'
import NextAuth, { getServerSession } from 'next-auth'
import EmailProvider, { type SendVerificationRequestParams } from 'next-auth/providers/email'
import GoogleProvider from 'next-auth/providers/google'
import { createTranslator } from 'next-intl'
import nodemailer from 'nodemailer'

import { MagicLinkEmail } from '@emails/verify-magic-link'
import { UserRole } from '@lib/constants/role.enum'
import { ROUTES } from '@lib/constants/routes.const'
import { authLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { render } from '@react-email/render'

const createMailerTransporter = (provider?: SendVerificationRequestParams['provider']) => {
	const transporter = nodemailer.createTransport(
		provider?.server || {
			url: process.env.EMAIL_SERVER_URL,
		},
	)
	return transporter
}

async function sendVerificationRequest({ identifier, url, provider }: SendVerificationRequestParams) {
	const { cookies } = await import('next/headers')
	const sessionCookies = await cookies()
	const language = (sessionCookies.get('NEXT_LOCALE')?.value || DEFAULT_LANGUAGE) as Languages
	const transport = createMailerTransporter(provider)
	const t = createTranslator({
		locale: language,
		messages: (await import(`../../../locales/emails/${language}.json`)).default,
		namespace: 'magic-link',
	})
	const appName = process.env.APP_NAME!

	const result = await transport.sendMail({
		to: identifier,
		from: provider.from,
		subject: t('subject', { appName }),
		html: await render(
			MagicLinkEmail({
				appName,
				emailName: identifier.split('@')[0],
				loginUrl: url,
				expirationTime: ms(magicLinkMaxAge, { long: true }),
				locale: language,
			}),
		),
	})
	const failed = result.rejected.concat(result.pending).filter(Boolean)
	if (failed.length) {
		throw new Error(`Email(s) (${failed.join(', ')}) could not be sent`)
	}
}

const magicLinkMaxAge = ms('24h')
export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	secret: process.env.NEXTAUTH_SECRET,
	session: {
		strategy: 'jwt',
		maxAge: ms('30d'),
	},
	pages: {
		signIn: ROUTES.SIGNIN,
		verifyRequest: ROUTES.VERIFY_REQUEST,
		error: ROUTES.AUTH.ERROR,
	},
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_ID || '',
			clientSecret: process.env.GOOGLE_SECRET || '',
			allowDangerousEmailAccountLinking: true,
		}),
		EmailProvider({
			server: process.env.EMAIL_SERVER_URL,
			from: process.env.EMAIL_FROM || 'noreply@homewallet.local',
			sendVerificationRequest,
			maxAge: magicLinkMaxAge,
		}),
	],
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id
				token.sub = user.id
				token.role = user.role ?? UserRole.MEMBER
				token.picture = user.image || null

				Object.assign(token, user)
			}

			return token
		},

		async session({ session, token }) {
			session.isAuthenticated = !!token?.sub

			if (session.user) {
				if (!token.email || !token.name) {
					throw new Error('Token is missing required user information')
				}

				session.user.id = token.id
				session.user.email = token.email
				session.user.name = token.name
				session.user.image = token.image
				session.user.role = token.role as UserRole
				session.user.gender = token.gender as typeof session.user.gender
				session.user.householdIds = (token.householdIds as string[]) || []
			}

			return session
		},

		async signIn({ user, account }) {
			if (account?.type === 'oauth') {
				return true
			}

			if (account?.type === 'email') {
				if (!user.name && user.email) {
					user.name = `${user.email.split('@')[0]}`
				} else if (!user.name && !user.email) {
					return false
				}

				return true
			}

			return true
		},
	},
	// events: {
	// 	signIn(message) {
	// 		authLogger.info('User signed in: {user}, account: {account}, profile: {profile}, isNewUser: {isNewUser}', message)
	// 	},
	// 	session(message) {
	// 		authLogger.info('Session event: {message}', { message })
	// 	},
	// 	signOut(message) {
	// 		authLogger.info('Sign out event: {message}', { message })
	// 	},
	// 	createUser({ user }) {
	// 		authLogger.info('New user created: {user}', { user })
	// 	},
	// 	updateUser({ user }) {
	// 		authLogger.info('User updated: {user}', { user })
	// 	},
	// 	linkAccount({ user, account }) {
	// 		authLogger.info('Account linked: {user}, account: {account}', { user, account })
	// 	},
	// },
}

export const nextAuthHandler = NextAuth(authOptions)
type AuthSessionPromise<IsAuthenticated extends boolean = false> = IsAuthenticated extends true
	? Promise<NonNullable<Awaited<ReturnType<typeof getServerSession<typeof authOptions>>>>>
	: Promise<Awaited<ReturnType<typeof getServerSession<typeof authOptions>>>>

export function auth<IsAuthenticated extends boolean = false>() {
	return getServerSession(authOptions) as AuthSessionPromise<IsAuthenticated>
}
