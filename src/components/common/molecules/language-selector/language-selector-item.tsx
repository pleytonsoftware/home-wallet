'use client'

import { AVAILABLE_LANGUAGE_FLAGS_DICTIONARY } from '@/assets/flags'
import { LOCALE_DICTIONARY, Languages } from '@/i18n/languages'

import { Globe } from 'lucide-react'

import { DropdownMenuRadioItem } from '@atoms/dropdown-menu'
import { Icon } from '@atoms/icon'
import { redirect } from '@navigation'

type LanguageKey = keyof typeof AVAILABLE_LANGUAGE_FLAGS_DICTIONARY

type LanguageSelectorItemProps = {
	lang: LanguageKey
	path: string
	params: URLSearchParams
}

export const LanguageSelectorItem = ({ lang, path, params }: LanguageSelectorItemProps) => {
	const Flag = AVAILABLE_LANGUAGE_FLAGS_DICTIONARY[lang]
	const langName = LOCALE_DICTIONARY[lang]

	const handleClick = () => {
		redirect({
			href: {
				pathname: path,
				query: Object.fromEntries(params.entries()),
			},
			locale: lang as unknown as Languages,
		})
	}

	return (
		<DropdownMenuRadioItem value={lang} onClick={handleClick} className='flex items-center gap-2'>
			{Flag ? <Flag className='size-3' /> : <Icon IconComponent={Globe} />}
			<span className='truncate'>{langName}</span>
		</DropdownMenuRadioItem>
	)
}
