import { redirect } from 'next/navigation'

import { StatusCodes } from 'http-status-codes'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import { TooltipProvider } from '@atoms/tooltip'
import { AuthProvider } from '@auth/context/session'
import { QueryProvider } from '@contexts/query'
import { authorizedSession } from '@lib/auth/utils'
import { ROUTES } from '@lib/constants/routes.const'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
	const { session, error } = await authorizedSession()

	if (error?.status === StatusCodes.UNAUTHORIZED) {
		redirect(ROUTES.SIGNIN)
	}

	return (
		<TooltipProvider>
			<AuthProvider session={session}>
				<QueryProvider>
					<NuqsAdapter>{children}</NuqsAdapter>
				</QueryProvider>
			</AuthProvider>
		</TooltipProvider>
	)
}
