import type { TransactionFormMode } from '@transactions/types'
import type { FC } from 'react'

import { FileTextIcon, TableIcon, WandSparklesIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Toggler, type TogglerOption } from '@molecules/toggler'

interface TransactionModeTogglerProps {
	value: TransactionFormMode
	onChange: (value: TransactionFormMode) => void
}

export const TransactionModeToggler: FC<TransactionModeTogglerProps> = ({ value, onChange }) => {
	const t = useTranslations('transactions-personal-page.form')
	const tOthers = useTranslations('common.others')

	const options: Array<TogglerOption<TransactionFormMode>> = [
		{ value: 'single', label: t('mode.single'), Icon: FileTextIcon },
		{ value: 'multiple', label: t('mode.multiple'), Icon: TableIcon },
		{ value: 'AI', label: t('mode.ai'), Icon: WandSparklesIcon, disabled: true, tooltip: tOthers('coming-soon') },
	]

	return <Toggler value={value} onChange={onChange} options={options} className='flex' />
}
