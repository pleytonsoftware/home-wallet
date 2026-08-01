import { Pool } from 'pg'

import { PrismaClient, type Prisma } from '@hw-prisma/client'
import { prismaLogger } from '@lib/logger'
import { PrismaPg } from '@prisma/adapter-pg'

declare global {
	var prisma: PrismaClient<Prisma.LogLevel> | undefined
}

function getPrismaClient(): PrismaClient<Prisma.LogLevel> {
	if (global.prisma) return global.prisma

	const connectionString = process.env.DATABASE_URL

	if (!connectionString) {
		throw new Error('DATABASE_URL is not set')
	}

	const pool = new Pool({
		connectionString,
	})

	const adapter = new PrismaPg(pool)

	return new PrismaClient({
		adapter,
		errorFormat: 'minimal',
		log:
			process.env.NODE_ENV !== 'production'
				? ['error']
				: [
						{ emit: 'event', level: 'query' },
						{ emit: 'event', level: 'info' },
						{ emit: 'event', level: 'warn' },
						{ emit: 'event', level: 'error' },
					],
	})
}

export const prisma = getPrismaClient()

prisma.$on('query', (e) => {
	prismaLogger.debug('Query executed', {
		query: e.query,
		params: e.params,
		duration: e.duration,
	})
})

prisma.$on('info', (e) => {
	prismaLogger.info(e.message)
})

prisma.$on('warn', (e) => {
	prismaLogger.warning(e.message)
})

prisma.$on('error', (e) => {
	prismaLogger.error(e.message)
})

if (process.env.NODE_ENV !== 'production') {
	global.prisma = prisma
}

export type { Prisma }
