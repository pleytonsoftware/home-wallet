'use client'

import type { FC } from 'react'

import { useTranslations } from 'next-intl'

import { Field, FieldLabel } from '@atoms/field'
import { Switch } from '@atoms/switch'

interface TransactionAutosaveToggleProps {
	value: boolean
	onChange: (value: boolean) => void
}

/** Draft mode only — Quick add mode has no draft/autosave concept (each row saves individually, immediately). */
export const TransactionAutosaveToggle: FC<TransactionAutosaveToggleProps> = ({ value, onChange }) => {
	const t = useTranslations('transactions-personal-page.form.multiple')

	return (
		<Field orientation='horizontal' className='w-auto'>
			<FieldLabel htmlFor='draft-autosave' className='text-sm text-muted-foreground'>
				{t('autosave.toggle-label')}
			</FieldLabel>
			<Switch id='draft-autosave' size='sm' checked={value} onCheckedChange={onChange} />
		</Field>
	)
}
