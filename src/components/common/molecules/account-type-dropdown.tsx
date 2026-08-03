'use client'

import type { FC } from 'react'

import { Banknote, ChevronDownIcon, CreditCard, Landmark, Wallet, type LucideIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button, buttonVariants } from '@atoms/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@atoms/dropdown-menu'
import { cn } from '@cn'
import { useIsNativeMobile } from '@hooks/use-native-mobile'
import { ACCOUNT_TYPE } from '@lib/constants/account.enum'

const ACCOUNT_TYPES = Object.values(ACCOUNT_TYPE)

export const ACCOUNT_TYPE_ICONS: Record<ACCOUNT_TYPE, LucideIcon> = {
	[ACCOUNT_TYPE.BANK]: Landmark,
	[ACCOUNT_TYPE.CREDIT_CARD]: CreditCard,
	[ACCOUNT_TYPE.DEBIT_CARD]: CreditCard,
	[ACCOUNT_TYPE.CASH]: Banknote,
	[ACCOUNT_TYPE.OTHER]: Wallet,
}

interface AccountTypeDropdownProps {
	name: string
	value: ACCOUNT_TYPE
	onChange: (value: ACCOUNT_TYPE) => void
	disabled?: boolean
	container?: React.ComponentProps<typeof DropdownMenuContent>['container']
	modal?: React.ComponentProps<typeof DropdownMenu>['modal']
}

export const mapAccountTypeToOptions = (t: ReturnType<typeof useTranslations<'common.fields.account-type'>>) =>
	({
		[ACCOUNT_TYPE.BANK]: { name: t('options.bank') },
		[ACCOUNT_TYPE.CREDIT_CARD]: { name: t('options.credit_card') },
		[ACCOUNT_TYPE.DEBIT_CARD]: { name: t('options.debit_card') },
		[ACCOUNT_TYPE.CASH]: { name: t('options.cash') },
		[ACCOUNT_TYPE.OTHER]: { name: t('options.other') },
	}) as const

export const AccountTypeDropdown: FC<AccountTypeDropdownProps> = ({ name, value, onChange, disabled, container, modal }) => {
	const t = useTranslations('common.fields.account-type')
	const isNativeMobile = useIsNativeMobile()
	const options = mapAccountTypeToOptions(t)

	return isNativeMobile ? (
		<NativeSelect name={name} value={value} onChange={onChange} disabled={disabled} options={options} />
	) : (
		<DropdownMenu modal={modal}>
			<DropdownMenuTrigger asChild>
				<Button aria-label={options[value].name} variant='outline' disabled={disabled} className='w-full justify-between font-normal'>
					<span className='flex items-center gap-2 truncate'>
						<Icon type={value} />
						{options[value].name}
					</span>
					<ChevronDownIcon className='opacity-50' />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align='start' className='w-(--radix-dropdown-menu-trigger-width)' container={container}>
				<DropdownMenuRadioGroup value={value} onValueChange={(next) => onChange(next as ACCOUNT_TYPE)}>
					{ACCOUNT_TYPES.map((type) => (
						<DropdownMenuRadioItem key={type} value={type}>
							<span className='flex w-full items-center gap-2 truncate'>
								<Icon type={type} />
								{options[type].name}
							</span>
						</DropdownMenuRadioItem>
					))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}

const Icon: FC<{ type: ACCOUNT_TYPE }> = ({ type }) => {
	const IconComponent = ACCOUNT_TYPE_ICONS[type]
	return <IconComponent className='size-4 shrink-0 text-muted-foreground' />
}

const NativeSelect: FC<
	Pick<AccountTypeDropdownProps, 'name' | 'value' | 'onChange' | 'disabled'> & { options: Record<ACCOUNT_TYPE, { name: string }> }
> = ({ name, value, onChange, disabled, options }) => (
	<select
		id={name}
		name={name}
		value={value}
		disabled={disabled}
		onChange={(e) => onChange(e.target.value as ACCOUNT_TYPE)}
		className={cn(buttonVariants({ variant: 'outline' }), 'w-full appearance-none justify-between pr-8 font-normal')}
	>
		{ACCOUNT_TYPES.map((type) => (
			<option key={type} value={type}>
				{options[type].name}
			</option>
		))}
	</select>
)
