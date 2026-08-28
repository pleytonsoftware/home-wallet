import type { CreateTransactionInput } from '@lib/schemas/transaction/create-transaction'
import type { FC } from 'react'

import { useTranslations } from 'next-intl'
import { Controller, useFormContext } from 'react-hook-form'

import { Field, FieldLabel } from '@atoms/field'
import { BankAccountOption, BankAccountTrigger } from '@bank-accounts/components/bank-account-option'
import { getBankAccountsOptions } from '@bank-accounts/hooks/queries/get-bank-accounts-option'
import { formatBankAccountLabel } from '@bank-accounts/utils'
import { useHouseholdContext } from '@households/context/household.context'
import { EnumDropdown } from '@molecules/enum-dropdown'
import { useQuery } from '@tanstack/react-query'

import { useTransactionFormContainer } from './transaction-form.context'

const NO_ACCOUNT_VALUE = '__none__'

export const TransactionAccountField: FC = () => {
	const t = useTranslations('transactions-personal-page.form')
	const { household } = useHouseholdContext()
	const containerRef = useTransactionFormContainer()
	const { control, formState } = useFormContext<CreateTransactionInput>()

	const { data: bankAccounts = [] } = useQuery(getBankAccountsOptions(household.id))

	if (bankAccounts.length === 0) return null

	return (
		<Controller
			name='sourceAccountId'
			control={control}
			render={({ field }) => (
				<Field>
					<FieldLabel htmlFor={field.name}>{t('account.label')}</FieldLabel>
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
						disabled={formState.isSubmitting}
						container={containerRef.current}
						modal={false}
					/>
				</Field>
			)}
		/>
	)
}
