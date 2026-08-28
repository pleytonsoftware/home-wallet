import type { Locale } from 'date-fns/locale'

import { Languages } from '@/i18n/languages'

import { enUS, es } from 'date-fns/locale'

/** Maps the app's active locale to a `date-fns` `Locale` object — drives calendar week-start and month/weekday names. */
export const DATE_FNS_LOCALES: Record<Languages, Locale> = {
	[Languages.ENGLISH]: enUS,
	[Languages.SPANISH]: es,
}
