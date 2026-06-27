import type { NextAuthOptions } from 'next-auth'

import ms from 'ms'
import NextAuth, { getServerSession } from 'next-auth'
import EmailProvider, { type SendVerificationRequestParams } from 'next-auth/providers/email'
import GoogleProvider from 'next-auth/providers/google'
import nodemailer from 'nodemailer'

import { PrismaAdapter } from '@next-auth/prisma-adapter'

import { html, text } from './auth-html'
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

async function sendVerificationRequest(params: SendVerificationRequestParams) {
	const { identifier, url, provider, theme } = params
	const { host } = new URL(url)
	const transport = createMailerTransporter(provider)
	const result = await transport.sendMail({
		to: identifier,
		from: provider.from,
		subject: `Sign in to ${host}`,
		text: text({ url, host }),
		html: html({ url, host, theme }),
	})
	const failed = result.rejected.concat(result.pending).filter(Boolean)
	if (failed.length) {
		throw new Error(`Email(s) (${failed.join(', ')}) could not be sent`)
	}
}

export const authOptions: NextAuthOptions = {
	adapter: PrismaAdapter(prisma),
	secret: process.env.NEXTAUTH_SECRET,
	session: {
		strategy: 'jwt',
		maxAge: ms('30d'), // 30 days
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
			maxAge: ms('24h'),
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
