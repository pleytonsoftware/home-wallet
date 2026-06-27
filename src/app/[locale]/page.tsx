import Link from 'next/link'

import { getTranslations } from 'next-intl/server'

import { Button } from '@atoms/button'
import { ROUTES } from '@lib/constants/routes.const'

export default async function Home() {
	const t = await getTranslations('home-page')
	return (
		<div className='flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black'>
			<main className='flex flex-1 w-full max-w-full flex-col items-center justify-between py-32 px-16 sm:items-start'>
				<div>
					{t('title')}
					<p>Landing Page</p>
					<p>
						<Button asChild variant='default' size='lg'>
							<Link href={ROUTES.SIGNIN} className='flex items-center gap-2'>
								sign in
							</Link>
						</Button>
					</p>
				</div>
			</main>
		</div>
	)
}
