'use client'

import type { FC } from 'react'

import { useState } from 'react'

import { useTranslations } from 'next-intl'
import { useLocalStorage } from 'usehooks-ts'

import { Button } from '@atoms/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@atoms/dialog'

const INTRO_SEEN_STORAGE_KEY = 'transactions-multiple-intro-seen'

/**
 * A richer, one-time explainer for Multiple mode — shown as its own `Dialog` layered on top of the
 * transaction Sheet the first time a user enters this mode, distinct from the compact, always-available
 * `TransactionShortcutsPopover` keyboard reference. This component only ever mounts client-side (deep
 * inside a Sheet that's closed on first paint), so reading `localStorage` synchronously on mount is
 * safe — no SSR/hydration mismatch to guard against, so no effect is needed to decide the initial state.
 */
export const TransactionMultipleIntroDialog: FC = () => {
	const t = useTranslations('transactions-personal-page.form.multiple.intro')
	const [seen, setSeen] = useLocalStorage(INTRO_SEEN_STORAGE_KEY, false)
	const [open, setOpen] = useState(() => !seen)

	const handleOpenChange = (next: boolean) => {
		setOpen(next)
		if (!next && !seen) setSeen(true)
	}

	return (
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t('title')}</DialogTitle>
					<DialogDescription>{t('description')}</DialogDescription>
				</DialogHeader>

				<div className='flex flex-col gap-4 text-sm'>
					<div className='flex flex-col gap-1'>
						<p className='font-medium text-foreground'>{t('draft-mode.label')}</p>
						<p className='text-muted-foreground'>{t('draft-mode.description')}</p>
					</div>
					<div className='flex flex-col gap-1'>
						<p className='font-medium text-foreground'>{t('quick-add-mode.label')}</p>
						<p className='text-muted-foreground'>{t('quick-add-mode.description')}</p>
					</div>
					<p className='text-muted-foreground'>{t('tip')}</p>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button type='button'>{t('got-it')}</Button>
					</DialogClose>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
