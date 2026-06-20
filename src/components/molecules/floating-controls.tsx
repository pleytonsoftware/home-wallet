import type { FC } from 'react'

// import { Theme } from '@const/theme'
import { LanguageSelector } from '@molecules/language-selector'

// import { ThemeToggler } from '@molecules/ui/theme-toggler'

type FloatingControlsProps = {
	theme: string
}
export const FloatingControls: FC<FloatingControlsProps> = ({ theme }) => {
	return (
		<div className='fixed bottom-4 right-4 hidden md:flex items-center gap-2 z-10 rtl:flex-row-reverse flex-row'>
			<LanguageSelector />
			{/* <ThemeToggler defaultIsDarkMode={theme === Theme.dark} /> */}
		</div>
	)
}
