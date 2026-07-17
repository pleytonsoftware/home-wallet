import type { HouseholdSummary } from '@households/types'
import type { FC, PropsWithChildren } from 'react'

import { useLanguage } from '@/hooks/use-language'

import Link from 'next/link'

import { ChevronRight, Home } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from '@atoms/avatar'
import { Icon } from '@atoms/icon'
import { cn } from '@cn'
import { formatCurrency } from '@households/utils'
import { getInitials } from '@lib/utils/avatar'

interface HouseholdCardProps {
	household: HouseholdSummary
	href: string
}

export const HouseholdCard: FC<PropsWithChildren<HouseholdCardProps>> = ({ household, href }) => {
	const t = useTranslations('households-page')
	const locale = useLanguage()
	const { name, code, members, balance, income, spent, currency, isActive } = household

	return (
		<Link
			href={href}
			className={cn(
				'group relative flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-xs transition-colors hover:border-primary/50',
				isActive && 'border-primary ring-1 ring-primary/30',
			)}
		>
			{isActive && (
				<span className='absolute top-5 right-5 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground'>
					{t('active')}
				</span>
			)}

			<div className='flex items-start gap-3'>
				<span
					className={cn(
						'flex size-10 shrink-0 items-center justify-center rounded-full',
						isActive ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
					)}
				>
					<Icon IconComponent={Home} size='md' />
				</span>
				<div className='min-w-0'>
					<p className='truncate font-semibold'>{name}</p>
					<p className='text-sm text-muted-foreground'>
						{t('members-count', { count: household.members.length })}
						{code ? ` · ${code}` : ''}
					</p>
				</div>
			</div>

			<div className='grid grid-cols-3 gap-2'>
				<div className='rounded-lg bg-muted/60 p-2.5'>
					<p className='text-xs text-muted-foreground'>{t('stats.balance')}</p>
					<p className='truncate text-sm font-semibold'>{formatCurrency(balance, currency, locale)}</p>
				</div>
				<div className='rounded-lg bg-muted/60 p-2.5'>
					<p className='text-xs text-muted-foreground'>{t('stats.income')}</p>
					<p className='truncate text-sm font-semibold'>{formatCurrency(income, currency, locale)}</p>
				</div>
				<div className='rounded-lg bg-muted/60 p-2.5'>
					<p className='text-xs text-muted-foreground'>{t('stats.spent')}</p>
					<p className='truncate text-sm font-semibold'>{formatCurrency(spent, currency, locale)}</p>
				</div>
			</div>

			<div className='flex items-center justify-between'>
				<AvatarGroup>
					{members.map((member) => (
						<Avatar key={member.id} size='sm'>
							<AvatarImage src={member.image ?? undefined} alt={member.name} />
							<AvatarFallback>{getInitials(member.name)}</AvatarFallback>
						</Avatar>
					))}
				</AvatarGroup>
				<span className={cn('flex items-center gap-0.5 text-sm font-medium', isActive ? 'text-primary' : 'text-muted-foreground')}>
					{t('open')}
					<Icon IconComponent={ChevronRight} size='sm' />
				</span>
			</div>
		</Link>
	)
}
