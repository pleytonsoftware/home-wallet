import { Pool } from 'pg'

import { PrismaClient } from '@hw-prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

declare global {
	var prisma: PrismaClient | undefined
}

function getPrismaClient(): PrismaClient {
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
	})
}

export const prisma = getPrismaClient()

if (process.env.NODE_ENV !== 'production') {
	global.prisma = prisma
}
