'use client'

import type { FC } from 'react'

import { useTranslations } from 'next-intl'

import { BankAccountCard } from '@bank-accounts/components/bank-account-card'
import { BankAccountEmptyCard } from '@bank-accounts/components/bank-account-empty-card'
import { getBankAccountsOptions } from '@bank-accounts/hooks/queries/get-bank-accounts-option'
import { useHouseholdContext } from '@households/context/household.context'
import { useQuery } from '@tanstack/react-query'

export const BankAccountsGrid: FC = () => {
	const t = useTranslations('bank-accounts-page')
	const { household } = useHouseholdContext()
	const { data } = useQuery(getBankAccountsOptions(household.id))

	return (
		<div className='grid gap-4 sm:grid-cols-2'>
			{(data ?? []).map((bankAccount) => (
				<BankAccountCard key={bankAccount.id} bankAccount={bankAccount} />
			))}
			<BankAccountEmptyCard title={t('add-account.title')} description={t('add-account.description')} />
		</div>
	)
}
