export const ROUTES = {
	LANDING: '/',
	SIGNIN: '/signin',
	VERIFY_REQUEST: '/verify-request',
	AUTH: {
		ROOT: '/auth',
		ERROR: '/auth/error',
	},
	API_AUTH: '/api/auth',
	HOUSEHOLDS: '/households',
	ONBOARDING: {
		ROOT: '/onboarding',
		HOUSEHOLD: '/onboarding/household',
	},
	HOUSEHOLD: {
		ROOT: '/household/:id',
		BANK_ACCOUNTS: '/household/:id/bank-accounts',
		TRANSACTIONS: {
			RECURRING: '/household/:id/transactions/recurring',
		},
		BUDGETS: {
			PERSONAL: '/household/:id/budgets/personal',
			PERSONAL_MONTH: '/household/:id/budgets/personal/:month',
			SHARED: '/household/:id/budgets/shared',
			SHARED_MONTH: '/household/:id/budgets/shared/:month',
		},
		SETTINGS: {
			ROOT: '/household/:id/settings',
			GENERAL: '/household/:id/settings/general',
			MEMBERS: '/household/:id/settings/members',
			DANGER: '/household/:id/settings/danger',
		},
	},
} as const
