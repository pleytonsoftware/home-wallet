'use client'

import type { FC } from 'react'

import { useTranslations } from 'next-intl'

import { Kbd } from '@atoms/kbd'
import { HelpPopover } from '@molecules/help-popover'

const SHORTCUTS = [
	['Tab', 'tab'],
	['Shift + Tab', 'shift-tab'],
	['Enter', 'enter'],
	['⌘ + Enter', 'cmd-enter'],
	['↑ / ↓', 'arrows'],
	['Esc', 'esc'],
] as const

/** A compact, manually-triggered keyboard-shortcuts reference — the first-visit explainer lives in `TransactionMultipleIntroDialog` instead. */
export const TransactionShortcutsPopover: FC = () => {
	const t = useTranslations('transactions-personal-page.form.multiple.shortcuts')

	return (
		<HelpPopover ariaLabel={t('trigger-label')}>
			<div className='flex flex-col gap-2'>
				<p className='font-medium'>{t('title')}</p>
				{SHORTCUTS.map(([keys, labelKey]) => (
					<div key={labelKey} className='flex items-center justify-between gap-3 text-sm'>
						<span className='text-muted-foreground'>{t(labelKey)}</span>
						<Kbd>{keys}</Kbd>
					</div>
				))}
			</div>
		</HelpPopover>
	)
}
