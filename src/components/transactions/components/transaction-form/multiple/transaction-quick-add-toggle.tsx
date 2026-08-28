'use client'

import type { FC } from 'react'

import { useTranslations } from 'next-intl'

import { Field, FieldLabel } from '@atoms/field'
import { Switch } from '@atoms/switch'

interface TransactionQuickAddToggleProps {
	value: boolean
	onChange: (value: boolean) => void
}

export const TransactionQuickAddToggle: FC<TransactionQuickAddToggleProps> = ({ value, onChange }) => {
	const t = useTranslations('transactions-personal-page.form.multiple')

	return (
		<Field orientation='horizontal' className='w-auto'>
			<FieldLabel htmlFor='quick-add-mode' className='text-sm text-muted-foreground'>
				{t('quick-add.label')}
			</FieldLabel>
			<Switch id='quick-add-mode' size='sm' checked={value} onCheckedChange={onChange} />
		</Field>
	)
}
