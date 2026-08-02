import type { HouseholdSummary } from '@households/types'

import { useLanguage } from '@/hooks/use-language'

import Link from 'next/link'
import { useState, type FC, type PropsWithChildren } from 'react'

import { ChevronRight, ClipboardCopyIcon, Home, CheckIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { useCopyToClipboard, useDebounceCallback } from 'usehooks-ts'

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount, AvatarImage } from '@atoms/avatar'
import { Button } from '@atoms/button'
import { Icon } from '@atoms/icon'
import { cn } from '@cn'
import { getInitials } from '@lib/utils/avatar'
import { pd } from '@lib/utils/events'

import { HouseholdCardStats } from './household-card-stat'

interface HouseholdCardProps {
	household: HouseholdSummary
	href: string
}

const stats = ['balance', 'income', 'spent'] as const
const MEMBER_MAX_DISPLAY = 3

export const HouseholdCard: FC<PropsWithChildren<HouseholdCardProps>> = ({
	household: { name, code, members, currency, isActive, ...household },
	href,
}) => {
	const t = useTranslations('households-page')
	const locale = useLanguage()
	const [, setCopytoClipboard] = useCopyToClipboard()
	const [isCopied, setIsCopied] = useState<boolean>(false)
	const debounceCopied = useDebounceCallback(() => setIsCopied(false), 3000)
	const copyToClipboardEvent = pd(() => {
		setCopytoClipboard(code!)
		setIsCopied(true)
		toast.success(t('copied-clipboard'))
		debounceCopied()
	})

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
						{t('members-count', { count: members.length })}
						{code && (
							<span className='inline-flex ml-2 gap-2 items-center'>
								<span>·</span>
								<span>{code}</span>
								{
									<Button
										size='icon-xs'
										variant={isCopied ? 'ghost-no-hover' : 'ghost'}
										className='-ml-1'
										onClick={isCopied ? undefined : copyToClipboardEvent}
									>
										<Icon
											key={isCopied ? 'copied' : 'copy'}
											className={cn('size-3.5 animate-[flip-in_300ms_ease-out]', isCopied && 'text-green-500')}
											IconComponent={isCopied ? CheckIcon : ClipboardCopyIcon}
										/>
									</Button>
								}
							</span>
						)}
					</p>
				</div>
			</div>

			<div className='grid grid-cols-3 gap-2'>
				{stats.map((stat) => (
					<HouseholdCardStats key={stat} amount={household[stat]} currency={currency} locale={locale} text={t(`stats.${stat}`)} />
				))}
			</div>

			<div className='flex items-center justify-between'>
				<AvatarGroup>
					{members.slice(0, MEMBER_MAX_DISPLAY).map((member) => (
						<Avatar key={member.id} size='sm'>
							<AvatarImage src={member.image ?? undefined} alt={member.name} />
							<AvatarFallback>{getInitials(member.name)}</AvatarFallback>
						</Avatar>
					))}
					{members.length > MEMBER_MAX_DISPLAY && <AvatarGroupCount>+{members.length - MEMBER_MAX_DISPLAY}</AvatarGroupCount>}
				</AvatarGroup>
				<span className={cn('flex items-center gap-0.5 text-sm font-medium', isActive ? 'text-primary' : 'text-muted-foreground')}>
					{t('open')}
					<Icon IconComponent={ChevronRight} size='sm' />
				</span>
			</div>
		</Link>
	)
}
