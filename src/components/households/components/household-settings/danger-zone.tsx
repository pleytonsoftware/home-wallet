'use client'

import type { BankAccountTransferPlanEntry } from '@actions/bank-account/shared/transfer-plan'

import { type MouseEventHandler, useCallback, useState, type FC } from 'react'

import { useTranslations } from 'next-intl'
import { Controller } from 'react-hook-form'

import { getLeaveHouseholdImpact } from '@actions/household/danger'
import { Field, FieldError, FieldLabel } from '@atoms/field'
import { Input } from '@atoms/input'
import { DangerZoneRow } from '@households/components/household-settings/danger-zone-row'
import { SettingsSection } from '@households/components/household-settings/settings-section'
import { useHouseholdContext } from '@households/context/household.context'
import { useDangerZoneActions } from '@households/hooks/forms/use-danger-zone-actions.hook'
import { useDeleteConfirmationForm } from '@households/hooks/forms/use-danger-zone-forms.hook'
import { ConfirmSaveButton } from '@molecules/confirm-save-button'

const DELETE_FORM_ID = 'danger-zone-delete-form'

export const DangerZone: FC = () => {
	const t = useTranslations('settings.danger')
	const tSections = useTranslations('settings.sections')
	const { household, isAdmin } = useHouseholdContext()
	const { regenerate, leave, deleteHousehold } = useDangerZoneActions(household)
	const deleteForm = useDeleteConfirmationForm(household.name, t)
	const [leaveImpact, setLeaveImpact] = useState<BankAccountTransferPlanEntry[]>([])

	const code = regenerate.data?.success ? regenerate.data.data.code : household.code

	const executeRegenerate = useCallback<MouseEventHandler<HTMLButtonElement>>(() => regenerate.mutateAsync(), [regenerate])
	const executeLeave = useCallback<MouseEventHandler<HTMLButtonElement>>(() => leave.mutateAsync(), [regenerate])
	const fetchLeaveImpact = useCallback(async () => {
		const res = await getLeaveHouseholdImpact(household.id)
		setLeaveImpact(res.success ? res.data : [])
	}, [household.id])

	return (
		<SettingsSection title={tSections('danger')} description={t('subtitle')} className='border-destructive/40'>
			{isAdmin && (
				<DangerZoneRow
					label={t('regenerate-code.label')}
					description={t('regenerate-code.description')}
					error={regenerate.error?.message}
					action={
						<ConfirmSaveButton
							variant='outline'
							loading={regenerate.isPending}
							confirmVariant='destructive'
							dialogTitle={t('regenerate-code.label')}
							dialogDescription={t('regenerate-code.confirm')}
							confirm={t('regenerate-code.label')}
							disabled={household.isInviteCodeOnCooldown}
							onConfirmClick={executeRegenerate}
						>
							{t('regenerate-code.label')}
						</ConfirmSaveButton>
					}
				>
					{code && <p className='mt-1 font-mono text-sm'>{code}</p>}
				</DangerZoneRow>
			)}

			{!isAdmin && !household.isOwner && (
				<DangerZoneRow
					label={t('leave.label')}
					description={t('leave.description')}
					error={leave.error?.message}
					action={
						<ConfirmSaveButton
							variant='destructive'
							loading={leave.isPending}
							confirmVariant='destructive'
							dialogTitle={t('leave.label')}
							dialogDescription={t('leave.confirm')}
							dialogChildren={
								leaveImpact.length > 0 && (
									<ul className='flex flex-col gap-1 text-sm text-muted-foreground'>
										{leaveImpact.map((entry) => (
											<li key={entry.accountId}>
												{entry.action === 'transfer'
													? t('leave.impact.transfer', { account: entry.accountName, member: entry.transferTo?.name ?? '' })
													: t('leave.impact.delete', { account: entry.accountName })}
											</li>
										))}
									</ul>
								)
							}
							confirm={t('leave.label')}
							onOpenChange={(nextOpen) => nextOpen && fetchLeaveImpact()}
							onConfirmClick={executeLeave}
						>
							{t('leave.label')}
						</ConfirmSaveButton>
					}
				/>
			)}

			{household.isOwner && (
				<DangerZoneRow
					label={t('delete.label')}
					description={t('delete.description')}
					error={deleteHousehold.error?.message}
					action={
						<ConfirmSaveButton
							variant='destructive'
							loading={deleteHousehold.isPending}
							formId={DELETE_FORM_ID}
							confirmVariant='destructive'
							confirmDisabled={!deleteForm.formState.isValid}
							onOpenChange={(nextOpen) => nextOpen && deleteForm.reset()}
							dialogTitle={t('delete.label')}
							dialogDescription={t('delete.confirm')}
							confirm={t('delete.label')}
							dialogChildren={
								<form id={DELETE_FORM_ID} onSubmit={deleteForm.handleSubmit((data) => deleteHousehold.mutateAsync(data.confirmName))}>
									<Controller
										control={deleteForm.control}
										name='confirmName'
										render={({ field, fieldState }) => (
											<Field data-invalid={!!fieldState.error}>
												<FieldLabel htmlFor={field.name}>
													{t('delete.confirm-name-prompt', { name: household.name })}
												</FieldLabel>
												<Input autoFocus autoComplete='off' {...field} />
												{fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
											</Field>
										)}
									/>
								</form>
							}
						>
							{t('delete.label')}
						</ConfirmSaveButton>
					}
				/>
			)}
		</SettingsSection>
	)
}
