'use client'

import type { BankAccountSummary } from '@bank-accounts/types'
import type { FC, ReactNode } from 'react'

import { useRef } from 'react'

import { useTranslations } from 'next-intl'

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@atoms/sheet'
import { BankAccountForm } from '@bank-accounts/components/bank-account-form/bank-account-form'

interface BankAccountFormSheetProps {
	mode: 'create' | 'edit'
	bankAccount?: BankAccountSummary
	open: boolean
	onOpenChange: (open: boolean) => void
	/** Rendered via `SheetTrigger asChild` when provided — omit when the sheet is opened imperatively (e.g. from a menu item). */
	trigger?: ReactNode
}

export const BankAccountFormSheet: FC<BankAccountFormSheetProps> = ({ mode, bankAccount, open, onOpenChange, trigger }) => {
	const t = useTranslations('bank-accounts-page.form')
	const containerRef = useRef<HTMLDivElement>(null)

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			{trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
			<SheetContent className='flex flex-col gap-0 overflow-y-auto max-w-full! w-full! md:max-w-xl!' ref={containerRef}>
				<SheetHeader>
					<SheetTitle>{mode === 'create' ? t('create-title') : t('edit-title')}</SheetTitle>
					<SheetDescription>{mode === 'create' ? t('create-description') : t('edit-description')}</SheetDescription>
				</SheetHeader>

				<BankAccountForm mode={mode} bankAccount={bankAccount} containerRef={containerRef} onSuccess={() => onOpenChange(false)} />
			</SheetContent>
		</Sheet>
	)
}
