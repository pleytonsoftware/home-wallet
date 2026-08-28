'use client'

import type { ReactNode, Ref } from 'react'

import { createContext, useContext } from 'react'

import { Drawer, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from '@atoms/drawer'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from '@atoms/sheet'
import { useIsMobile } from '@hooks/use-mobile'

const ResponsiveSheetContext = createContext(false)

const useResponsiveSheetIsMobile = () => useContext(ResponsiveSheetContext)

interface ResponsiveSheetProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	children: ReactNode
}

/**
 * Renders a `Sheet` on desktop and a `Drawer` on narrow/mobile viewports — only one of the two
 * ever mounts (never both), so this adds no bundle or runtime cost beyond whichever surface is
 * already in use elsewhere in the app. Compose with `ResponsiveSheetTrigger`/`Content`/`Header`/
 * `Title`/`Description`, which mirror the `Sheet*`/`Drawer*` atom API.
 */
function ResponsiveSheet({ children, ...props }: ResponsiveSheetProps) {
	const isMobile = useIsMobile()

	return (
		<ResponsiveSheetContext.Provider value={isMobile}>
			{isMobile ? <Drawer {...props}>{children}</Drawer> : <Sheet {...props}>{children}</Sheet>}
		</ResponsiveSheetContext.Provider>
	)
}

interface ResponsiveSheetTriggerProps {
	asChild?: boolean
	children: ReactNode
}

function ResponsiveSheetTrigger(props: ResponsiveSheetTriggerProps) {
	return useResponsiveSheetIsMobile() ? <DrawerTrigger {...props} /> : <SheetTrigger {...props} />
}

interface ResponsiveSheetContentProps {
	className?: string
	children: ReactNode
	ref?: Ref<HTMLDivElement>
	/** See `SheetContent`/`DrawerContent`'s `actionsNode` — identical shape on both. */
	actionsNode?: ReactNode | ((container: HTMLDivElement | null) => ReactNode)
	/** Forwarded to the underlying Radix/vaul content — call `event.preventDefault()` to keep Escape from closing the sheet. */
	onEscapeKeyDown?: (event: KeyboardEvent) => void
}

function ResponsiveSheetContent({ ref, ...props }: ResponsiveSheetContentProps) {
	return useResponsiveSheetIsMobile() ? <DrawerContent ref={ref} {...props} /> : <SheetContent ref={ref} {...props} />
}

interface ResponsiveSheetTextProps {
	className?: string
	children: ReactNode
}

function ResponsiveSheetHeader(props: ResponsiveSheetTextProps) {
	return useResponsiveSheetIsMobile() ? <DrawerHeader {...props} /> : <SheetHeader {...props} />
}

function ResponsiveSheetTitle(props: ResponsiveSheetTextProps) {
	return useResponsiveSheetIsMobile() ? <DrawerTitle {...props} /> : <SheetTitle {...props} />
}

function ResponsiveSheetDescription(props: ResponsiveSheetTextProps) {
	return useResponsiveSheetIsMobile() ? <DrawerDescription {...props} /> : <SheetDescription {...props} />
}

function ResponsiveSheetFooter(props: ResponsiveSheetTextProps) {
	return useResponsiveSheetIsMobile() ? <DrawerFooter {...props} /> : <SheetFooter {...props} />
}

export {
	ResponsiveSheet,
	ResponsiveSheetTrigger,
	ResponsiveSheetContent,
	ResponsiveSheetHeader,
	ResponsiveSheetTitle,
	ResponsiveSheetDescription,
	ResponsiveSheetFooter,
}
