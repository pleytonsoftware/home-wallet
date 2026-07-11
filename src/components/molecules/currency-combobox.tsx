'use client'

import type { CurrencyCode, CurrencyCodeRecord } from 'currency-codes-ts/dist/types'
import type { ComponentProps, FC } from 'react'

import { useCallback, useDeferredValue, useMemo, useState } from 'react'

import { code as getCurrencyDetails, codes } from 'currency-codes-ts'
import { useTranslations } from 'next-intl'

import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from '@atoms/combobox'
import { Item, ItemContent, ItemDescription, ItemTitle } from '@atoms/item'
import { useLanguage } from '@hooks/use-language'
import { capitalize } from '@lib/utils/string'

import { formatCurrency, getCurrencyName, getCurrencySymbol } from '../households/utils'

interface CurrencyComboboxProps extends Pick<ComponentProps<typeof ComboboxContent>, 'container'> {
	id?: string
	name: string
	onChange: (value: string) => void
	placeholder?: string
	emptyLabel?: string
	disabled?: boolean
}

const POPULAR_CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'GBP'] satisfies CurrencyCode[]
const currencies: CurrencyCode[] = codes()
const currencyDetailsList = [
	...POPULAR_CURRENCIES.filter((code) => currencies.includes(code)),
	...currencies.filter((code) => !POPULAR_CURRENCIES.includes(code)),
].map((currency) => ({
	...getCurrencyDetails(currency)!,
	amount: Math.random() * 100000, // Random amount for demonstration purposes
}))

export const CurrencyCombobox: FC<CurrencyComboboxProps> = ({ id, name, onChange, placeholder, emptyLabel, disabled, container }) => {
	const [query, setQuery] = useState('')
	const lang = useLanguage()
	const t = useTranslations('common.fields.currency')
	const filterCurrencies = (query: string) => {
		if (!query) return currencyDetailsList

		return currencyDetailsList.filter((currency) => {
			if (!currency) return false
			const { code, currency: name, countries } = currency
			const lowerQuery = query.toLowerCase()

			return (
				code.toLowerCase().includes(lowerQuery) ||
				name.toLowerCase().includes(lowerQuery) ||
				countries.some((country) => country.toLowerCase().includes(lowerQuery))
			)
		})
	}
	const itemToString = useCallback((currency: CurrencyCodeRecord) => {
		const symbol = getCurrencySymbol(currency.code, lang)

		return currency
			? `${currency.code} ${`${symbol !== currency.code ? `(${symbol})` : ''}`} —  ${capitalize(getCurrencyName(currency, lang))}`
			: ''
	}, [])

	const deferredQuery = useDeferredValue(query)
	const filtered = useMemo(() => filterCurrencies(deferredQuery), [deferredQuery])

	return (
		<Combobox<CurrencyCodeRecord>
			items={filtered}
			itemToStringValue={itemToString}
			itemToStringLabel={itemToString}
			onValueChange={(next) => next && onChange(next.code)}
			disabled={disabled}
			modal={!!container}
		>
			<ComboboxInput id={id} name={name} placeholder={placeholder || t('placeholder')} onChange={(e) => setQuery(e.target.value)} />
			<ComboboxContent container={container}>
				<ComboboxEmpty>{emptyLabel || t('empty')}</ComboboxEmpty>
				<ComboboxList className='overflow-x-hidden'>
					{(currency: (typeof currencyDetailsList)[number]) => {
						const title = itemToString(currency)
						return (
							<ComboboxItem key={currency.code} value={currency} className='pr-4' title={title}>
								<Item size='xs' className='p-0'>
									<ItemContent className='line-clamp-1'>
										<ItemTitle className='whitespace-nowrap text-ellipsis line-clamp-1 w-full'>{title}</ItemTitle>
										<ItemDescription>{formatCurrency(currency.amount, currency.code, lang, currency.digits)}</ItemDescription>
									</ItemContent>
								</Item>
							</ComboboxItem>
						)
					}}
				</ComboboxList>
			</ComboboxContent>
		</Combobox>
	)
}
