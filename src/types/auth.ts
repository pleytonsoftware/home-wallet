/* eslint-disable @typescript-eslint/no-empty-object-type */

import type { Session as HWSession, User as HWUser } from '@hw-prisma/client'
import type { Role } from '@lib/constants/role.enum'

import 'next-auth/jwt'

type UserWithRole = HWUser & { role: Role; householdIds?: string[] }

declare module 'next-auth' {
	interface Session extends HWSession {
		user: UserWithRole
	}

	interface User extends UserWithRole {}
}

declare module 'next-auth/jwt' {
	interface JWT extends HWUser {
		householdIds?: string[]
	}
}
