import { getTranslations } from 'next-intl/server'

export default async function Home() {
	const t = await getTranslations('home-page')
	return (
		<div className='flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black'>
			<main className='flex flex-1 w-full max-w-full flex-col items-center justify-between py-32 px-16 sm:items-start'>{t('title')}</main>
		</div>
	)
}
