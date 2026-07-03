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
