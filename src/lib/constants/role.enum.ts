export enum MemberRole {
	/**
	 * Admin role has full access to the household and can manage members, transactions, and settings.
	 */
	ADMIN = 'ADMIN',

	/**
	 * Member role has limited access to the household and can only view and manage their own transactions.
	 */
	MEMBER = 'MEMBER',
}

export enum UserRole {
	ADMIN = 'ADMIN',
	MEMBER = 'MEMBER',
}

/**
 * Normalizes a raw `HouseholdMember.role` string into a {@link MemberRole}.
 *
 * The column is a free-form string whose Prisma default is the lowercase `"member"`,
 * while application code writes the uppercase enum values (`"ADMIN"`/`"MEMBER"`).
 * This reconciles both casings; anything unrecognized falls back to {@link MemberRole.MEMBER}.
 */
export const parseMemberRole = (value: string | null | undefined): MemberRole =>
	value?.toUpperCase() === MemberRole.ADMIN ? MemberRole.ADMIN : MemberRole.MEMBER
