'use client'

import { AVAILABLE_LANGUAGE_FLAGS_DICTIONARY } from '@/assets/flags'
import { AVAILABLE_LANGUAGES, LOCALE_DICTIONARY } from '@/i18n/languages'

import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

import { LanguagesIcon } from 'lucide-react'

import { Button } from '@atoms/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuTrigger } from '@atoms/dropdown-menu'
import { useLanguage } from '@hooks/use-language'
import { usePathname } from '@navigation'

import { LanguageSelectorItem } from './language-selector-item'

type LanguageKey = keyof typeof AVAILABLE_LANGUAGE_FLAGS_DICTIONARY

export const LanguageSelector = () => {
	const language = useLanguage()
	const path = usePathname()
	const params = useSearchParams()

	const languagesNode = useMemo(
		() => AVAILABLE_LANGUAGES.map((lang) => <LanguageSelectorItem key={lang} lang={lang as LanguageKey} path={path} params={params} />),
		[AVAILABLE_LANGUAGES, language, path, params],
	)

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant='outline' size='sm' className='shadow-lg'>
					<LanguagesIcon className='size-4' />
					{LOCALE_DICTIONARY[language]}
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='end' className='w-64 max-h-60 overflow-y-auto'>
				<DropdownMenuRadioGroup value={language}>{languagesNode}</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
