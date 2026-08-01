declare namespace NodeJS {
	interface ProcessEnv {
		NEXT_PUBLIC_BASE_URL?: string
		APP_NAME?: string

		INVITE_CODE_REGENERATE_COOLDOWN_MS?: string

		DATABASE_URL: string
		NEXTAUTH_SECRET: string
		NEXTAUTH_URL: string

		GOOGLE_ID?: string
		GOOGLE_SECRET?: string

		EMAIL_SERVER_HOST?: string
		EMAIL_SERVER_PORT?: string
		EMAIL_FROM?: string
	}
}
