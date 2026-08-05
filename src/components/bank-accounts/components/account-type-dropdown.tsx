'use client'

import { useMemo, type FC } from 'react'

import { Banknote, CreditCard, Landmark, Wallet, type LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Icon } from '@atoms/icon'
import { ACCOUNT_TYPE } from '@lib/constants/account.enum'
import { EnumDropdown, type EnumDropdownProps } from '@molecules/enum-dropdown'

const ACCOUNT_TYPES = Object.values(ACCOUNT_TYPE)

export const ACCOUNT_TYPE_ICONS: Record<ACCOUNT_TYPE, LucideIcon> = {
	[ACCOUNT_TYPE.BANK]: Landmark,
	[ACCOUNT_TYPE.CREDIT_CARD]: CreditCard,
	[ACCOUNT_TYPE.DEBIT_CARD]: CreditCard,
	[ACCOUNT_TYPE.CASH]: Banknote,
	[ACCOUNT_TYPE.OTHER]: Wallet,
}

type AccountTypeDropdownProps = Omit<EnumDropdownProps<ACCOUNT_TYPE>, 'values' | 'getLabel' | 'renderTrigger' | 'renderOption'>

export const mapAccountTypeToOptions = (t: ReturnType<typeof useTranslations<'common.fields.account-type'>>) =>
	({
		[ACCOUNT_TYPE.BANK]: { name: t('options.bank') },
		[ACCOUNT_TYPE.CREDIT_CARD]: { name: t('options.credit_card') },
		[ACCOUNT_TYPE.DEBIT_CARD]: { name: t('options.debit_card') },
		[ACCOUNT_TYPE.CASH]: { name: t('options.cash') },
		[ACCOUNT_TYPE.OTHER]: { name: t('options.other') },
	}) as const

type AccountTypeOptions = ReturnType<typeof mapAccountTypeToOptions>

const AccountTypeTrigger: FC<{ option: AccountTypeOptions[ACCOUNT_TYPE]; type: ACCOUNT_TYPE }> = ({ option, type }) => (
	<>
		<Icon IconComponent={ACCOUNT_TYPE_ICONS[type]} size='sm' className='shrink-0 text-muted-foreground' />
		{option.name}
	</>
)
const AccountTypeOption: FC<{ option: AccountTypeOptions[ACCOUNT_TYPE]; type: ACCOUNT_TYPE }> = ({ option, type }) => (
	<span className='flex w-full items-center gap-2 truncate'>
		<Icon IconComponent={ACCOUNT_TYPE_ICONS[type]} size='sm' className='shrink-0 text-muted-foreground' />
		{option.name}
	</span>
)

export const AccountTypeDropdown: FC<AccountTypeDropdownProps> = (props) => {
	const t = useTranslations('common.fields.account-type')
	const options = useMemo(() => mapAccountTypeToOptions(t), [t])

	return (
		<EnumDropdown
			{...props}
			values={ACCOUNT_TYPES}
			getLabel={(type) => options[type].name}
			renderTrigger={(type) => <AccountTypeTrigger option={options[type]} type={type} />}
			renderOption={(type) => <AccountTypeOption option={options[type]} type={type} />}
		/>
	)
}
