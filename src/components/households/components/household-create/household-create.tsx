'use client'

import type { FC, ReactNode } from 'react'

import { useRef, useState } from 'react'

import { useTranslations } from 'next-intl'

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@atoms/sheet'

import { HouseholdCreateForm } from './household-create-form'

interface HouseholdCreateProps {
	/** Element that opens the sheet — rendered via `SheetTrigger asChild`, so callers own the trigger button. */
	trigger: ReactNode
}

export const HouseholdCreate: FC<HouseholdCreateProps> = ({ trigger }) => {
	const t = useTranslations('common.forms.households.create')
	const [open, setOpen] = useState(false)
	const containerRef = useRef<HTMLDivElement>(null)

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>{trigger}</SheetTrigger>
			<SheetContent className='flex flex-col gap-0 overflow-y-auto' ref={containerRef}>
				<SheetHeader>
					<SheetTitle>{t('title')}</SheetTitle>
					<SheetDescription>{t('description')}</SheetDescription>
				</SheetHeader>

				<HouseholdCreateForm setOpen={setOpen} containerRef={containerRef} />
			</SheetContent>
		</Sheet>
	)
}
