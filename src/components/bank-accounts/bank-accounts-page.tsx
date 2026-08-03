'use client'

import type { FC } from 'react'

import { WalletIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { BankAccountsGrid } from '@bank-accounts/components/bank-accounts-grid'
import { PageHeader } from '@molecules/page-header'

export const BankAccountsPage: FC = () => {
	const t = useTranslations('bank-accounts-page')

	return (
		<div className='mx-auto flex w-full flex-col gap-6 py-4 px-4 sm:px-0'>
			<PageHeader icon={WalletIcon} eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />
			<BankAccountsGrid />
		</div>
	)
}
