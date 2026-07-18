import Link from 'next/link'

import { SidebarHeader } from '@atoms/sidebar'
import { ROUTES } from '@lib/constants/routes.const'
import { Logo } from '@molecules/logo'

export function SidebarBrand() {
	return (
		<SidebarHeader className='transition-all duration-200 ease-linear group-data-[collapsible=icon]:py-0' title='Go to dashboard'>
			<div className='transition-all duration-200 ease-linear py-1 flex items-center group-data-[collapsible=icon]:justify-center'>
				<Link href={ROUTES.LANDING} className='flex items-center gap-4 transition-transform duration-200 ease-linear w-full'>
					<Logo text={false} className='mt-2 w-8 shrink-0' imgClassName='group-data-[collapsible=icon]:w-6' />
					<div className='overflow-hidden ml-2 transition-[max-width,opacity,margin] duration-200 ease-linear max-w-40 group-data-[collapsible=icon]:max-w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:mask-[linear-gradient(to_right,black_calc(100%-1.5rem),transparent_100%)]'>
						<span className='text-xl text-card-foreground font-semibold display-title whitespace-nowrap'>
							{process.env.NEXT_PUBLIC_APP_NAME}
						</span>
					</div>
				</Link>
			</div>
		</SidebarHeader>
	)
}
