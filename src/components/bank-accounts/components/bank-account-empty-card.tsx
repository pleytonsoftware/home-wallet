'use client'

import type { FC } from 'react'

import { useState } from 'react'

import { Plus } from 'lucide-react'

import { Button } from '@atoms/button'
import { Icon } from '@atoms/icon'
import { BankAccountFormSheet } from '@bank-accounts/components/bank-account-form/bank-account-form-sheet'
import { CARD_MIN_HEIGHT } from '@bank-accounts/constants/card'
import { cn } from '@cn'

interface BankAccountEmptyCardProps {
	title: string
	description: string
}

export const BankAccountEmptyCard: FC<BankAccountEmptyCardProps> = ({ title, description }) => {
	const [open, setOpen] = useState(false)

	return (
		<>
			<Button
				type='button'
				variant='link'
				onClick={() => setOpen(true)}
				className={cn(
					'flex h-full flex-col no-underline! items-center justify-center gap-2 rounded-2xl border border-dashed border-grey/100 p-5 text-center transition-colors hover:border-primary/50 hover:bg-muted/40 hover:shadow',
					CARD_MIN_HEIGHT,
				)}
			>
				<span className='flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground'>
					<Icon IconComponent={Plus} size='md' />
				</span>
				<p className='font-semibold'>{title}</p>
				<p className='text-sm text-muted-foreground'>{description}</p>
			</Button>
			<BankAccountFormSheet mode='create' open={open} onOpenChange={setOpen} />
		</>
	)
}
