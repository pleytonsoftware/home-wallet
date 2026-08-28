'use client'

import type { FC } from 'react'

import { useTranslations } from 'next-intl'
import { Controller, useFormContext } from 'react-hook-form'

import { BankAccountOption, BankAccountTrigger } from '@bank-accounts/components/bank-account-option'
import { getBankAccountsOptions } from '@bank-accounts/hooks/queries/get-bank-accounts-option'
import { formatBankAccountLabel } from '@bank-accounts/utils'
import { EnumDropdown } from '@molecules/enum-dropdown'
import { useQuery } from '@tanstack/react-query'
import { useTransactionFormContainer } from '@transactions/components/transaction-form/transaction-form.context'

const NO_ACCOUNT_VALUE = '__none__'

interface TransactionRowAccountCellProps {
	/** RHF field path for `sourceAccountId` — `'sourceAccountId'` standalone, or `` `rows.${index}.sourceAccountId` `` in a field array. */
	name: string
	householdId: string
	disabled?: boolean
}

export const TransactionRowAccountCell: FC<TransactionRowAccountCellProps> = ({ name, householdId, disabled }) => {
	const t = useTranslations('transactions-personal-page.form')
	const { control } = useFormContext()
	const containerRef = useTransactionFormContainer()
	const { data: bankAccounts = [] } = useQuery(getBankAccountsOptions(householdId))

	if (bankAccounts.length === 0) return null

	return (
		<Controller
			name={name}
			control={control}
			render={({ field }) => (
				<EnumDropdown
					name={field.name}
					value={field.value ?? NO_ACCOUNT_VALUE}
					onChange={(value) => field.onChange(value === NO_ACCOUNT_VALUE ? undefined : value)}
					values={[NO_ACCOUNT_VALUE, ...bankAccounts.map((account) => account.id)]}
					getLabel={(value) => {
						if (value === NO_ACCOUNT_VALUE) return t('account.none')
						const account = bankAccounts.find((a) => a.id === value)
						return account ? formatBankAccountLabel(account) : ''
					}}
					renderTrigger={(selectedValue) => {
						if (selectedValue === NO_ACCOUNT_VALUE) return t('account.none')
						const account = bankAccounts.find((a) => a.id === selectedValue)
						return account ? <BankAccountTrigger bankAccount={account} /> : ''
					}}
					renderOption={(optionValue) => {
						if (optionValue === NO_ACCOUNT_VALUE) return t('account.none')
						const account = bankAccounts.find((a) => a.id === optionValue)
						return account ? <BankAccountOption bankAccount={account} /> : ''
					}}
					disabled={disabled}
					container={containerRef.current}
					modal={false}
					triggerClassName='h-9 border-0 shadow-none bg-muted/40'
				/>
			)}
		/>
	)
}
