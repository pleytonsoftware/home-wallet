'use client'

import type { BankAccountSummary } from '@bank-accounts/types'
import type { FC } from 'react'

import { useState } from 'react'

import { EllipsisVerticalIcon, PencilIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@atoms/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@atoms/dropdown-menu'
import { Icon } from '@atoms/icon'
import { BankAccountDeleteButton } from '@bank-accounts/components/bank-account-delete-button'
import { BankAccountFormSheet } from '@bank-accounts/components/bank-account-form/bank-account-form-sheet'
import { CARD_MIN_HEIGHT } from '@bank-accounts/constants/card'
import { cn } from '@cn'
import { ACCOUNT_TYPE_ICONS, mapAccountTypeToOptions } from '@molecules/account-type-dropdown'
import { MemberAvatar } from '@molecules/member-avatar'
import { MemberAvatarGroup } from '@molecules/member-avatar-group'

interface BankAccountCardProps {
	bankAccount: BankAccountSummary
}

export const BankAccountCard: FC<BankAccountCardProps> = ({ bankAccount }) => {
	const t = useTranslations('bank-accounts-page')
	const tAccountType = useTranslations('common.fields.account-type')
	const [isEditOpen, setIsEditOpen] = useState(false)
	const typeIcon = ACCOUNT_TYPE_ICONS[bankAccount.type]
	const typeLabel = mapAccountTypeToOptions(tAccountType)[bankAccount.type]

	return (
		<div
			className={cn(
				'group relative flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-xs transition-colors hover:border-primary/50 justify-between',
				CARD_MIN_HEIGHT,
			)}
		>
			<div className='flex items-start justify-between gap-3'>
				<div className='flex items-start gap-3 min-w-0'>
					<span className='flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground'>
						<Icon IconComponent={typeIcon} size='md' />
					</span>
					<div className='min-w-0'>
						<p className='truncate font-semibold'>{bankAccount.name}</p>
						<p className='text-sm text-muted-foreground'>
							{typeLabel.name}
							{bankAccount.lastFourDigits && <span> · •••• {bankAccount.lastFourDigits}</span>}
						</p>
					</div>
				</div>

				{bankAccount.isOwner && (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant='ghost' size='icon-sm' aria-label={t('card.actions')}>
								<Icon IconComponent={EllipsisVerticalIcon} size='sm' />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuItem onSelect={() => setIsEditOpen(true)}>
								<Icon IconComponent={PencilIcon} size='sm' />
								{t('card.edit')}
							</DropdownMenuItem>
							<BankAccountDeleteButton bankAccount={bankAccount} />
						</DropdownMenuContent>
					</DropdownMenu>
				)}
			</div>

			<div className='flex items-center justify-between gap-2'>
				{bankAccount.sharedWith.length > 0 ? (
					<MemberAvatarGroup members={bankAccount.sharedWith} max={3} />
				) : (
					<span className='text-xs text-muted-foreground'>{t('card.not-shared')}</span>
				)}

				{!bankAccount.isOwner && (
					<span className='flex items-center gap-1.5 text-xs text-muted-foreground'>
						<MemberAvatar member={bankAccount.owner} size='sm' />
						{t('card.owned-by', { name: bankAccount.owner.name })}
					</span>
				)}
			</div>

			{bankAccount.isOwner && <BankAccountFormSheet mode='edit' bankAccount={bankAccount} open={isEditOpen} onOpenChange={setIsEditOpen} />}
		</div>
	)
}
