import type { FC, PropsWithChildren, ReactNode } from 'react'

import { cn } from '@cn'
import { HelpPopover } from '@molecules/help-popover'

interface SettingsSectionProps {
	title: ReactNode
	description?: ReactNode
	/** Optional trailing content in the header (e.g. a help popover or a badge). */
	headerAction?: ReactNode
	/** Optional footer row, typically the save button or destructive action. */
	footer?: ReactNode
	className?: string
	help?: ReactNode
}

/**
 * Reusable, presentational wrapper for a single block of settings.
 * Renders a titled, bordered card with an optional description, header action and footer.
 */
export const SettingsSection: FC<PropsWithChildren<SettingsSectionProps>> = ({
	title,
	description,
	headerAction,
	footer,
	className,
	children,
	help,
}) => (
	<section className={cn('flex flex-col gap-5 rounded-2xl border bg-card p-5 shadow-xs', className)}>
		<header className='flex items-start justify-between gap-3 border-b pb-4'>
			<div className='flex flex-col gap-1'>
				<h3 className='flex items-center justify-between font-semibold leading-none gap-1'>
					{title}
					{help && <HelpPopover>{help}</HelpPopover>}
				</h3>
				{description && <p className='text-sm text-muted-foreground'>{description}</p>}
			</div>
			{headerAction}
		</header>

		{children && <div className='flex flex-col gap-6'>{children}</div>}

		{footer && <footer className='flex items-center justify-end gap-2 border-t pt-4'>{footer}</footer>}
	</section>
)
