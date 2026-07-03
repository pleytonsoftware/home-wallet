import type { LayoutProps } from '@/types/app'
import type { Metadata } from 'next'
import type { HTMLProps, PropsWithChildren } from 'react'

import { Montserrat, Quicksand } from 'next/font/google'

import { NextIntlClientProvider } from 'next-intl'

import { cn } from '@cn'
import { FloatingControls } from '@molecules/floating-controls'

import '../globals.css'

export type ResolveLocaleLayoutProps<T = unknown> = T & {
	params: LayoutProps['params']
}

type LocaleLayoutProps<T = unknown> = ResolveLocaleLayoutProps<PropsWithChildren<HTMLProps<HTMLBodyElement & T>>> & {
	htmlProps?: HTMLProps<HTMLHtmlElement> & Record<`data-${string}`, string>
}

const montserrat = Montserrat({
	variable: '--font-montserrat',
	subsets: ['latin'],
	style: ['italic', 'normal'],
})

const quicksand = Quicksand({
	variable: '--font-quicksand',
	subsets: ['latin'],
	display: 'swap',
})

export const metadata: Metadata = {
	title: process.env.APP_NAME,
	description: `${process.env.APP_NAME} helps you manage home finances, track income and expenses, and monitor your savings.`,
}

export default async function RootLayout({ children, params }: Readonly<LocaleLayoutProps>) {
	return (
		<NextIntlClientProvider>
			<html lang={(await params).locale} className={cn('h-full', 'antialiased', montserrat.variable, quicksand.variable, 'font-sans')}>
				<body className='min-h-full flex flex-col'>
					{children}
					<FloatingControls theme={''} />
				</body>
			</html>
		</NextIntlClientProvider>
	)
}
