import { TrendingDownIcon, TrendingUpIcon, type LucideIcon } from 'lucide-react'

import { PAYMENT_TYPE } from '@lib/constants/payment.enum'

export const TransactionTypeIcon: Record<PAYMENT_TYPE, LucideIcon> = {
	[PAYMENT_TYPE.EXPENSE]: TrendingDownIcon,
	[PAYMENT_TYPE.INCOME]: TrendingUpIcon,
}
