export enum Languages {
	ENGLISH = 'en', // English
	SPANISH = 'es', // Spanish
}

export enum DisabledLanguages {
	PORTUGUESE = 'pt', // Portuguese
	CATALAN = 'ca', // Catalan
	BASQUE = 'eu', // Basque
	GALICIAN = 'gl', // Galician
}

export const AVAILABLE_LANGUAGES = [...Object.values(Languages)] as const
export const DEFAULT_LANGUAGE = Languages.ENGLISH
export const I18NEXT_IDENTIFIER = 'i18next'
export const RTL_LANGUAGES = [] as const // empty array for now, but can be populated with languages that are written from right to left (e.g., Arabic, Hebrew) in the future

export const LOCALE_NAMESPACES = {
	common: 'common',
	seo: 'seo',
	notFound: 'not-found',
} as const

export type AVAILABLE_LANGUAGE_CODES = `${Languages}`
export type DISABLED_LANGUAGE_CODES = `${DisabledLanguages}`
export type LANGUAGE_CODES = AVAILABLE_LANGUAGE_CODES | DISABLED_LANGUAGE_CODES
export const LOCALE_DICTIONARY: Record<LANGUAGE_CODES, string> = {
	en: 'English',
	es: 'Español',
	pt: 'Português',
	ca: 'Català',
	eu: 'Euskara',
	gl: 'Galego',
}
