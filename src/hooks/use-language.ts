import type { Languages } from '@/i18n/languages'

import { useLocale } from 'next-intl'

const useLanguage = () => useLocale() as Languages

export { useLanguage }
