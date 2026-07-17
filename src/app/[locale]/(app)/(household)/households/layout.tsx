import { cn } from '@cn'
import { HouseholdsLayoutHeader } from '@households/households-layout-header'
import { auth } from '@lib/auth'

const MAX_WIDTH_CONTENT = 'max-w-4xl'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	const session = await auth<true>()

	return (
		<main className='min-h-screen bg-background-2'>
			<HouseholdsLayoutHeader user={session.user} maxWidthContentClass={MAX_WIDTH_CONTENT} />
			<div className={cn('mx-auto p-4', MAX_WIDTH_CONTENT)}>{children}</div>
		</main>
	)
}
