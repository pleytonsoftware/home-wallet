/* eslint-disable @typescript-eslint/no-empty-object-type */
import type { Role } from '@/lib/constants/role.enum'
import type { Session as HWSession, User as HWUser } from '@hw-prisma/client'

import 'next-auth/jwt'

type UserWithRole = HWUser & { role: Role }

declare module 'next-auth' {
	interface Session extends HWSession {
		user: UserWithRole
	}

	interface User extends UserWithRole {}
}

declare module 'next-auth/jwt' {
	interface JWT extends HWUser {}
}
