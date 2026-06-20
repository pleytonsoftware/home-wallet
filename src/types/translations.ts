import type LocaleKeys from '@locales/en.json'
import type { MessageKeys, NamespaceKeys, NestedKeyOf, NestedValueOf } from 'next-intl'

import { formats } from '@/i18n/request'
import { routing } from '@/i18n/routing'

declare module 'next-intl' {
	interface AppConfig {
		Locale: (typeof routing.locales)[number]
		Messages: typeof LocaleKeys
		Formats: typeof formats
	}

	type NamespacedMessageKeys<
		TranslatorMessages extends Record<string, unknown>,
		Namespace extends NamespaceKeys<TranslatorMessages, NestedKeyOf<TranslatorMessages>> = never,
	> = MessageKeys<
		NestedValueOf<
			{
				'!': TranslatorMessages
			},
			[Namespace] extends [never] ? '!' : `!.${Namespace}`
		>,
		NestedKeyOf<
			NestedValueOf<
				{
					'!': TranslatorMessages
				},
				[Namespace] extends [never] ? '!' : `!.${Namespace}`
			>
		>
	>
	type TransKeys<Namespace extends NamespaceKeys<AppConfig['Messages'], NestedKeyOf<AppConfig['Messages']>> = 'common'> = NamespacedMessageKeys<
		AppConfig['Messages'],
		Namespace
	>
}
