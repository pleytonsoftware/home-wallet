import type { ComponentProps, FC, ReactNode } from 'react'

import { useTranslations } from 'next-intl'

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@atoms/alert-dialog'
import { Button, type ButtonProps } from '@atoms/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@atoms/tooltip'

export type ConfirmSaveButton = ButtonProps & {
	openDialog?: boolean
	dialogTitle?: string
	dialogDescription?: string
	dialogChildren?: ReactNode
	cancel?: string
	confirm?: ReactNode
	confirmVariant?: ButtonProps['variant']
	confirmDisabled?: boolean
	formId?: string
	onOpenChange?: ComponentProps<typeof AlertDialog>['onOpenChange']
	onCancelClick?: ComponentProps<typeof AlertDialogCancel>['onClick']
	onConfirmClick?: ComponentProps<typeof AlertDialogAction>['onClick']
	btnTooltip?: ReactNode
}

export const ConfirmSaveButton: FC<ConfirmSaveButton> = ({
	openDialog,
	dialogTitle,
	dialogDescription,
	dialogChildren,
	cancel,
	confirm,
	confirmVariant,
	confirmDisabled,
	formId,
	onOpenChange,
	children,
	onCancelClick,
	onConfirmClick,
	btnTooltip,
	...buttonProps
}) => {
	const t = useTranslations('common.confirm.save')

	let btn = (
		<AlertDialogTrigger asChild>
			<Button type='button' {...buttonProps} disabled={buttonProps.disabled}>
				{children || t('save')}
			</Button>
		</AlertDialogTrigger>
	)

	if (btnTooltip) {
		btn = (
			<Tooltip>
				<TooltipTrigger asChild>{btn}</TooltipTrigger>
				<TooltipContent>{btnTooltip}</TooltipContent>
			</Tooltip>
		)
	}

	return (
		<AlertDialog open={openDialog} onOpenChange={onOpenChange}>
			{btn}
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>{dialogTitle || t('title')}</AlertDialogTitle>
					{dialogDescription && <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>}
				</AlertDialogHeader>
				{dialogChildren}
				<AlertDialogFooter>
					<AlertDialogCancel onClick={onCancelClick}>{cancel || t('cancel')}</AlertDialogCancel>
					<AlertDialogAction form={formId} type='submit' variant={confirmVariant} disabled={confirmDisabled} onClick={onConfirmClick}>
						{confirm || t('confirm')}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
