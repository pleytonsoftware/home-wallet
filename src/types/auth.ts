/* eslint-disable @typescript-eslint/no-empty-object-type */

import type { Session as HWSession, User as HWUser } from '@hw-prisma/client'
import type { UserRole } from '@lib/constants/role.enum'

import 'next-auth/jwt'

export enum UserGenderType {
	male = 'male',
	female = 'female',
}
type UserWithRole = HWUser & { role: UserRole; householdIds?: string[]; gender?: UserGenderType }

declare module 'next-auth' {
	interface Session extends HWSession {
		user: UserWithRole
		isAuthenticated: boolean
	}

	interface User extends UserWithRole {}
}

declare module 'next-auth/jwt' {
	interface JWT extends HWUser {}
}
