'use client'

import type { FC, ReactNode } from 'react'

import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { Button } from '@atoms/button'
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle, DrawerTrigger } from '@atoms/drawer'
import { FieldError } from '@atoms/field'
import { JoinCodeField } from '@households/components/household-join/join-code-field'
import { HOUSEHOLDS_QUERY_KEYS } from '@households/constants/query-keys'
import { useJoinHouseholdForm } from '@households/hooks/forms/use-join-household-form.hook'
import { joinHouseholdMutationOptions } from '@households/hooks/mutations/join-household.hook'
import { ROUTES } from '@lib/constants/routes.const'
import { logger } from '@lib/logger'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface HouseholdJoinDrawerProps {
	/** Element that opens the drawer — rendered via `DrawerTrigger asChild`, so callers own the trigger button. */
	trigger: ReactNode
}

export const HouseholdJoinDrawer: FC<HouseholdJoinDrawerProps> = ({ trigger }) => {
	const [open, setOpen] = useState(false)
	const t = useTranslations('households-page.join-form')
	const router = useRouter()
	const containerRef = useRef<HTMLDivElement>(null)
	const queryClient = useQueryClient()
	const form = useJoinHouseholdForm(t)

	const joinMutation = useMutation(
		joinHouseholdMutationOptions({
			onSuccess: (result) => {
				if (!result.success) {
					if (typeof result.error === 'string') {
						form.setError('root', {
							type: 'manual',
							message: result.error || t('error.generic'),
						})
					} else if (Array.isArray(result.error)) {
						result.error.forEach((issue) => {
							const path = (typeof issue.path[0] === 'string' ? issue.path[0] : issue.path[0].toString()) as 'code' | 'root'
							form.setError(path, {
								type: issue.code,
								message: issue.message,
							})
						})
					}
					throw new Error(typeof result.error === 'string' ? result.error : t('error.generic'))
				}

				setOpen(false)
				form.reset()
				queryClient.invalidateQueries({ queryKey: HOUSEHOLDS_QUERY_KEYS.households })

				toast.success(t('success'))
				router.push(ROUTES.HOUSEHOLD.ROOT.replace(':id', result.data.id))
			},
			onError: (error) => {
				if (!form.formState.errors.root) {
					form.setError('root', {
						type: 'manual',
						message: error instanceof Error ? error.message : t('error.generic'),
					})
				}
				toast.error(error instanceof Error ? error.message : t('error.generic'))
			},
		}),
	)

	const handleJoinHousehold = useCallback<Parameters<typeof form.handleSubmit>[0]>(
		async (data) => {
			try {
				await joinMutation.mutateAsync(data.code)
			} catch (e) {
				logger.error('Error joining household: {error}', { error: e })
				// Error is handled in onError callback
				throw e
			}
		},
		[joinMutation],
	)

	return (
		<Drawer open={open} onOpenChange={setOpen}>
			<DrawerTrigger asChild>{trigger}</DrawerTrigger>
			<DrawerContent ref={containerRef} className='min-h-[75dvh] sm:min-h-auto sm:pb-10'>
				<div className='mx-auto w-full max-w-sm h-full'>
					<DrawerHeader>
						<DrawerTitle>{t('title')}</DrawerTitle>
						<DrawerDescription>{t('description')}</DrawerDescription>
					</DrawerHeader>

					<form onSubmit={form.handleSubmit(handleJoinHousehold)} className='flex flex-col gap-6 px-4 pb-4'>
						<JoinCodeField
							control={form.control}
							disabled={joinMutation.isPending}
							label={t('invite-code.label')}
							placeholder={t('invite-code.placeholder')}
						/>

						{form.formState.errors.root && <FieldError>{form.formState.errors.root.message}</FieldError>}

						<Button
							type='submit'
							className='w-full'
							disabled={joinMutation.isPending || !form.formState.isValid}
							loading={joinMutation.isPending}
						>
							{t('submit-button')}
						</Button>
					</form>
				</div>
			</DrawerContent>
		</Drawer>
	)
}
