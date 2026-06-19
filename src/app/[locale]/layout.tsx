import type { LayoutProps } from '@/types/app'
import type { Metadata } from 'next'
import type { HTMLProps, PropsWithChildren } from 'react'

import { Geist, Geist_Mono, Inter } from 'next/font/google'

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

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: process.env.APP_NAME,
	description: `${process.env.APP_NAME} helps you manage home finances, track income and expenses, and monitor your savings.`,
}

export default async function RootLayout({ children, params }: Readonly<LocaleLayoutProps>) {
	return (
		<NextIntlClientProvider>
			<html
				lang={(await params).locale}
				className={cn('h-full', 'antialiased', geistSans.variable, geistMono.variable, 'font-sans', inter.variable)}
			>
				<body className='min-h-full flex flex-col'>
					{children}
					<FloatingControls theme={''} />
				</body>
			</html>
		</NextIntlClientProvider>
	)
}
