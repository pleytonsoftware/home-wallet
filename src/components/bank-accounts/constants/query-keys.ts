export const BANK_ACCOUNTS_QUERY_KEYS = {
	bankAccounts: (householdId: string) => ['bank-accounts', householdId] as const,
} as const
