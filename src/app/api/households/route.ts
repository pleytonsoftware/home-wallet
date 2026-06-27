import { NextResponse } from 'next/server'

import { auth } from '@lib/auth'
import { prisma } from '@lib/prisma'

export async function POST(request: Request) {
	try {
		const session = await auth()

		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const body = await request.json()
		const { name } = body

		if (!name || typeof name !== 'string' || name.trim().length === 0) {
			return NextResponse.json({ error: 'Household name is required' }, { status: 400 })
		}

		// Create household and add user as admin member
		const household = await prisma.household.create({
			data: {
				name: name.trim(),
				members: {
					create: {
						userId: session.user.id,
						role: 'ADMIN',
					},
				},
			},
			include: {
				members: true,
			},
		})

		return NextResponse.json(household, { status: 201 })
	} catch (error) {
		console.error('[households POST]', error)
		return NextResponse.json({ error: error instanceof Error ? error.message : 'Internal server error' }, { status: 500 })
	}
}
