'use client'

import type { NavConfig } from '@molecules/navigation/types'

import { SettingsIcon, BanknoteCheckIcon, WalletIcon } from 'lucide-react'
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
	tSidebar: ReturnType<typeof useTranslations<'common.sidebar'>>
	household: HouseholdContextType['household']
}
const NAV_CONFIG: (params: NavConfigParams) => NavConfig = ({ t, tSidebar, household }) => {
	return [
		{
			label: household.name,
			items: [
				{
					title: tSidebar('bankAccounts'),
					icon: WalletIcon,
					url: ROUTES.HOUSEHOLD.BANK_ACCOUNTS.replace(':id', household.id),
					prefetch: true,
				},
				{
					// TODO: Add all the household-related routes here, like dashboard, transactions, budgets, etc.
					title: tSidebar('transactions'),
					icon: BanknoteCheckIcon,
					tooltip: 'View and manage transactions',
					items: [
						{ title: 'Shared', url: '/transactions/shared' },
						{ title: 'Personal', url: '/transactions/personal' },
					],
				},
				{
					title: tSidebar('settings'),
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
	const tSidebar = useTranslations('common.sidebar')

	if (!session) {
		throw new Error('Session is required to render the sidebar')
	}

	const user = session.user

	return (
		<Sidebar collapsible='icon' className='bg-background'>
			<SidebarBrand />
			<SidebarContent>
				<NavBuilder config={NAV_CONFIG({ t, tSidebar, household })} />
			</SidebarContent>
			<SidebarFooter>
				<SidebarUser user={user} onSignout={handleSignOut} />
			</SidebarFooter>
		</Sidebar>
	)
}
