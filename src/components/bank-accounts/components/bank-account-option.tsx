import type { BankAccountSummary } from '@bank-accounts/types'
import type { FC } from 'react'

import { Icon } from '@atoms/icon'
import { ACCOUNT_TYPE_ICONS } from '@bank-accounts/components/account-type-dropdown'

type BankAccountLabelData = Pick<BankAccountSummary, 'name' | 'type' | 'lastFourDigits'>

export const BankAccountTrigger: FC<{ bankAccount: BankAccountLabelData }> = ({ bankAccount }) => (
	<>
		<Icon IconComponent={ACCOUNT_TYPE_ICONS[bankAccount.type]} size='sm' className='shrink-0 text-muted-foreground' />
		{bankAccount.name}
	</>
)

export const BankAccountOption: FC<{ bankAccount: BankAccountLabelData }> = ({ bankAccount }) => (
	<span className='flex w-full items-center gap-2 truncate'>
		<Icon IconComponent={ACCOUNT_TYPE_ICONS[bankAccount.type]} size='sm' className='shrink-0 text-muted-foreground' />
		<span className='truncate'>
			{bankAccount.name}
			{bankAccount.lastFourDigits && <span className='text-muted-foreground'> · •••• {bankAccount.lastFourDigits}</span>}
		</span>
	</span>
)
