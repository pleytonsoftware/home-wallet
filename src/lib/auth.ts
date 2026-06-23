import type { PrismaClient as PrismaClientType } from '@prisma/client'
import type { NextAuthOptions } from 'next-auth'

import ms from 'ms'
import EmailProvider from 'next-auth/providers/email'
import GoogleProvider from 'next-auth/providers/google'
import nodemailer from 'nodemailer'
import { Pool } from 'pg'

import { PrismaClient } from '@hw-prisma/client'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { PrismaPg } from '@prisma/adapter-pg'

import { Role } from './constants/role.enum'

let prisma: PrismaClient | null = null

function getPrismaClient(): PrismaClientType {
	if (prisma) return prisma as unknown as PrismaClientType

	const connectionString = process.env.DATABASE_URL

	if (!connectionString) {
		throw new Error('DATABASE_URL is not set')
	}

	const pool = new Pool({
		connectionString,
	})

	const adapter = new PrismaPg(pool)

	prisma = new PrismaClient({
		adapter,
		errorFormat: 'minimal',
	})

	return prisma as unknown as PrismaClientType
}

const prismaInstance = (() => {
	try {
		return getPrismaClient()
	} catch (e) {
		if (process.env.NODE_ENV !== 'production') {
			// eslint-disable-next-line no-console
			console.warn('Database not available:', e)
			return null
		}
		throw e
	}
})()

const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_SERVER_HOST,
	port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
	secure: process.env.EMAIL_SERVER_SECURE === 'true',
	auth: process.env.EMAIL_SERVER_USER
		? {
				user: process.env.EMAIL_SERVER_USER,
				pass: process.env.EMAIL_SERVER_PASSWORD,
			}
		: undefined,
})

export const authOptions: NextAuthOptions = {
	adapter: prismaInstance ? PrismaAdapter(prismaInstance) : undefined,
	secret: process.env.NEXTAUTH_SECRET,
	session: {
		strategy: 'jwt',
		maxAge: 30 * 24 * 60 * 60, // 30 days
	},
	pages: {
		signIn: '/signin',
		verifyRequest: '/auth/verify-request',
		error: '/auth/error',
	},
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_ID || '',
			clientSecret: process.env.GOOGLE_SECRET || '',
			allowDangerousEmailAccountLinking: true,
		}),
		EmailProvider({
			server: transporter,
			from: process.env.EMAIL_FROM || 'noreply@homewallet.local',
			maxAge: ms('24h'),
		}),
	],
	callbacks: {
		async jwt({ token, user, account: _ }) {
			if (user) {
				token.id = user.id
				token.email = user.email
				token.name = user.name
				token.image = user.image || null
				token.role = user.role || Role.MEMBER
				token.householdId = user.householdId
			}

			// Refresh token data from database on every request
			if (token.id && prismaInstance) {
				try {
					const dbUser = await prismaInstance.user.findUnique({
						where: { id: token.id },
					})

					if (dbUser) {
						token.email = dbUser.email
						token.name = dbUser.name
						token.image = dbUser.image || null
						token.role = dbUser.role
						token.householdId = dbUser.householdId
					}
				} catch (error) {
					// eslint-disable-next-line no-console
					console.warn('Failed to refresh user data from database:', error)
				}
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
				session.user.householdId = token.householdId
			}

			return session
		},

		async signIn({ user, account }) {
			if (account?.type === 'oauth' && !user.householdId) {
				return true
			}

			if (account?.type === 'email') {
				// Email magic link sign in
				return true
			}

			return true
		},
	},
}
