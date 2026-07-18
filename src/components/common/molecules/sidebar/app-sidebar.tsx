'use client'

import type { NavConfig } from '@molecules/navigation/types'

import { SettingsIcon, User2Icon } from 'lucide-react'
import { useSession } from 'next-auth/react'

import { Sidebar, SidebarContent, SidebarFooter } from '@atoms/sidebar'
import { useSignOut } from '@auth/hooks/use-signout.hook'
import { NavBuilder } from '@molecules/navigation/nav-builder'

import { SidebarBrand } from './sidebar-brand'
import { SidebarUser } from './sidebar-user'

const NAV_CONFIG: (householdName: string) => NavConfig = (householdName) => [
	{
		label: householdName,
		items: [
			{
				// TODO: Add all the household-related routes here, like dashboard, transactions, budgets, etc.
				title: 'Member',
				url: '/accounts',
				icon: User2Icon,
				tooltip: 'View and manage user accounts',
			},
			{
				title: 'Settings',
				icon: SettingsIcon,
				items: [
					{ title: 'General', url: '/settings/general' as never },
					{ title: 'Roles', url: '/settings/roles' as never }, // TEMPORARY until we add the route and properly type the config
				],
			},
		],
	},
]

interface AppSidebarProps {
	householdName: string
}

export function AppSidebar({ householdName }: AppSidebarProps) {
	const { data: session } = useSession()
	const handleSignOut = useSignOut()

	if (!session) {
		throw new Error('Session is required to render the sidebar')
	}

	const user = session.user

	return (
		<Sidebar collapsible='icon' className='bg-background'>
			<SidebarBrand />
			<SidebarContent>
				<NavBuilder config={NAV_CONFIG(householdName)} />
			</SidebarContent>
			<SidebarFooter>
				<SidebarUser user={user} onSignout={handleSignOut} />
			</SidebarFooter>
		</Sidebar>
	)
}
