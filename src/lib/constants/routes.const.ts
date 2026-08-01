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
		SETTINGS: {
			ROOT: '/household/:id/settings',
			GENERAL: '/household/:id/settings/general',
			MEMBERS: '/household/:id/settings/members',
			DANGER: '/household/:id/settings/danger',
		},
	},
} as const
