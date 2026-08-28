'use client'

import type { NavConfig } from '@molecules/navigation/types'

import { SettingsIcon, BanknoteCheckIcon, WalletIcon, HandCoinsIcon } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'

import { Sidebar, SidebarContent, SidebarFooter } from '@atoms/sidebar'
import { useSignOut } from '@auth/hooks/use-signout.hook'
import { type HouseholdContextType, useHouseholdContext } from '@households/context/household.context'
import { ROUTES } from '@lib/constants/routes.const'
import { NavBuilder } from '@molecules/navigation/nav-builder'

import { SidebarBrand } from './sidebar-brand'
import { SidebarUser } from './sidebar-user'

interface NavConfigParams {
	t: ReturnType<typeof useTranslations<'settings'>>
	tCommon: ReturnType<typeof useTranslations<'common'>>
	household: HouseholdContextType['household']
}
const NAV_CONFIG: (params: NavConfigParams) => NavConfig = ({ t, tCommon, household }) => {
	return [
		{
			label: household.name,
			items: [
				{
					title: tCommon('sidebar.wallet'),
					icon: WalletIcon,
					url: ROUTES.HOUSEHOLD.BANK_ACCOUNTS.replace(':id', household.id),
					prefetch: true,
				},
				{
					title: tCommon('sidebar.transactions.$'),
					icon: BanknoteCheckIcon,
					items: [
						{
							title: tCommon('sidebar.transactions.recurring'),
							url: ROUTES.HOUSEHOLD.TRANSACTIONS.RECURRING.replace(':id', household.id),
							prefetch: true,
						},
					],
				},
				{
					title: tCommon('sidebar.budgets.$'),
					icon: HandCoinsIcon,
					items: [
						{
							title: tCommon('sidebar.budgets.personal'),
							url: ROUTES.HOUSEHOLD.BUDGETS.PERSONAL.replace(':id', household.id),
							prefetch: true,
						},
						{
							title: tCommon('sidebar.budgets.shared'),
							url: ROUTES.HOUSEHOLD.BUDGETS.SHARED.replace(':id', household.id),
							prefetch: true,
							disabled: true,
							badge: tCommon('others.coming-soon-badge'),
						},
					],
				},
				{
					title: tCommon('sidebar.settings'),
					icon: SettingsIcon,
					items: [
						{ title: t('sections.general'), url: ROUTES.HOUSEHOLD.SETTINGS.GENERAL.replace(':id', household.id), prefetch: true },
						{
							title: t('sections.members'),
							url: ROUTES.HOUSEHOLD.SETTINGS.MEMBERS.replace(':id', household.id),
							prefetch: true,
						},
						{
							title: t('sections.danger'),
							url: ROUTES.HOUSEHOLD.SETTINGS.DANGER.replace(':id', household.id),
							colour: 'destructive',
							prefetch: true,
						},
					],
				},
			],
		},
	]
}

export function AppSidebar() {
	const { data: session } = useSession()
	const { household } = useHouseholdContext()
	const handleSignOut = useSignOut()
	const t = useTranslations('settings')
	const tCommon = useTranslations('common')

	if (!session) {
		throw new Error('Session is required to render the sidebar')
	}

	const user = session.user

	return (
		<Sidebar collapsible='icon' className='bg-background'>
			<SidebarBrand />
			<SidebarContent>
				<NavBuilder config={NAV_CONFIG({ t, tCommon, household })} />
			</SidebarContent>
			<SidebarFooter>
				<SidebarUser user={user} onSignout={handleSignOut} />
			</SidebarFooter>
		</Sidebar>
	)
}
