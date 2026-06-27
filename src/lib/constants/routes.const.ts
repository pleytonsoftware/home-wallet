export const ROUTES = {
	LANDING: '/',
	SIGNIN: '/signin',
	VERIFY_REQUEST: '/verify-request',
	AUTH: {
		ROOT: '/auth',
		ERROR: '/auth/error',
	},
	API_AUTH: '/api/auth',
	DASHBOARD: '/dashboard',
	ONBOARDING: {
		ROOT: '/onboarding',
		HOUSEHOLD: '/onboarding/household',
	},
} as const
