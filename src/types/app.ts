import type { Languages } from '@/i18n/languages'

export type LayoutProps<T = object> = {
	params: Promise<{ locale: Languages }>
} & Readonly<T>
