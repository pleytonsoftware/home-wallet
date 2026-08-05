'use client'

import type { FC, PropsWithChildren } from 'react'
import type { Split, LastArrayElement } from 'type-fest'

import { useTranslations } from 'next-intl'

import { Tabs, TabsList, TabsTrigger } from '@atoms/tabs'
import { useHouseholdContext } from '@households/context/household.context'
import { ROUTES } from '@lib/constants/routes.const'
import { Title } from '@molecules/title'
import { Link, usePathname } from '@navigation'

type Route = typeof ROUTES.HOUSEHOLD.SETTINGS.GENERAL | typeof ROUTES.HOUSEHOLD.SETTINGS.MEMBERS | typeof ROUTES.HOUSEHOLD.SETTINGS.DANGER
interface SettingsSectionLink {
	slug: LastArrayElement<Split<Route, '/'>>
	route: string
	variant?: 'default' | 'destructive'
}

const getLastSlugOf = (path: Route) => path.split('/').at(-1) as SettingsSectionLink['slug']

const SECTIONS: SettingsSectionLink[] = [
	{ slug: getLastSlugOf(ROUTES.HOUSEHOLD.SETTINGS.GENERAL), route: ROUTES.HOUSEHOLD.SETTINGS.GENERAL },
	{ slug: getLastSlugOf(ROUTES.HOUSEHOLD.SETTINGS.MEMBERS), route: ROUTES.HOUSEHOLD.SETTINGS.MEMBERS },
	{ slug: getLastSlugOf(ROUTES.HOUSEHOLD.SETTINGS.DANGER), route: ROUTES.HOUSEHOLD.SETTINGS.DANGER, variant: 'destructive' },
]

/**
 * Shared settings chrome: page header + section nav rail. Each settings page renders its own
 * content as `children` and self-gates any admin-only parts of it — every section is reachable
 * by every member.
 */
export const SettingsShell: FC<PropsWithChildren> = ({ children }) => {
	const t = useTranslations('settings')
	const { household } = useHouseholdContext()
	const pathname = usePathname()

	const activeSlug = SECTIONS.find(({ route }) => {
		const href = route.replace(':id', household.id)
		return pathname === href || pathname.startsWith(`${href}/`)
	})?.slug

	return (
		<div className='mx-auto flex w-full max-w-3xl flex-col gap-6 py-2'>
			<Title title={t('title')} subtitle={t('subtitle')} />

			<Tabs value={activeSlug}>
				<TabsList variant='line'>
					{SECTIONS.map(({ slug, route, variant }) => {
						const href = route.replace(':id', household.id)

						return (
							<TabsTrigger key={slug} value={slug} variant={variant} asChild>
								<Link href={href} prefetch>
									{t(`sections.${slug}`)}
								</Link>
							</TabsTrigger>
						)
					})}
				</TabsList>
			</Tabs>

			{children}
		</div>
	)
}
