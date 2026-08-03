export const BANK_ACCOUNTS_API_PATHS = {
	GET_BANK_ACCOUNTS: (householdId: string) => `/households/${householdId}/bank-accounts` as const,
	GET_BANK_ACCOUNT: (householdId: string, accountId: string) => `/households/${householdId}/bank-accounts/${accountId}` as const,
} as const
