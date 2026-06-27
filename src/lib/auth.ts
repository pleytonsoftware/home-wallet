import type { NextAuthOptions } from 'next-auth'

import { DEFAULT_LANGUAGE, type Languages } from '@/i18n/languages'

import ms from 'ms'
import NextAuth, { getServerSession } from 'next-auth'
import EmailProvider, { type SendVerificationRequestParams } from 'next-auth/providers/email'
import GoogleProvider from 'next-auth/providers/google'
import { createTranslator } from 'next-intl'
import nodemailer from 'nodemailer'

import { MagicLinkEmail } from '@emails/verify-magic-link'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { render } from '@react-email/render'

import { Role } from './constants/role.enum'
import { ROUTES } from './constants/routes.const'
import { prisma } from './prisma'

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
		messages: (await import(`../../locales/emails/${language}.json`)).default,
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
				token.email = user.email
				token.name = user.name
				token.image = user.image || null
				token.role = user.role ?? Role.MEMBER
				token.picture = user.image || null
				token.createdAt = user.createdAt

				// Fetch household memberships
				const memberships = await prisma.householdMember.findMany({
					where: { userId: user.id },
					select: { householdId: true },
				})
				token.householdIds = memberships.map((m) => m.householdId)
			}

			return token
		},

		async session({ session, token }) {
			if (session.user) {
				if (!token.email || !token.name) {
					throw new Error('Token is missing required user information')
				}

				session.user.id = token.id
				session.user.email = token.email
				session.user.name = token.name
				session.user.image = token.image
				session.user.role = token.role as Role
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
}

export const nextAuthHandler = NextAuth(authOptions)

export function auth() {
	return getServerSession(authOptions)
}
