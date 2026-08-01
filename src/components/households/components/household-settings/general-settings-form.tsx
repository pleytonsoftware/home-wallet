'use client'

import type { UpdateHouseholdSettingsInput } from '@lib/schemas/household/update-household-settings'
import type { FC } from 'react'

import { useCallback } from 'react'

import { RotateCcwIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Controller } from 'react-hook-form'

import { Button } from '@atoms/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@atoms/field'
import { Input } from '@atoms/input'
import { SettingsSection } from '@households/components/household-settings/settings-section'
import { useHouseholdContext } from '@households/context/household.context'
import { useGeneralSettingsSubmit } from '@households/hooks/forms/use-general-settings-submit.hook'
import { useUpdateHouseholdSettingsForm } from '@households/hooks/forms/use-update-household-settings-form.hook'
import { MAX_HOUSEHOLD_FULL_ADDRESS_LENGTH, MAX_HOUSEHOLD_NAME_LENGTH, MIN_HOUSEHOLD_NAME_LENGTH } from '@lib/schemas/household/create-household'
import { ConfirmSaveButton } from '@molecules/confirm-save-button'
import { CurrencyCombobox } from '@molecules/currency-combobox'
import { SplitStrategyDropdown, SplitStrategyLabel } from '@molecules/split-strategy-dropdown'
import { SwitchField } from '@molecules/switch-field'

const formId = 'general-settings-form'

export const GeneralSettingsForm: FC = () => {
	const t = useTranslations('settings.general')
	const tSections = useTranslations('settings.sections')
	const createT = useTranslations('common.forms.households.create')
	const { household, isAdmin } = useHouseholdContext()
	const readOnly = !isAdmin
	const form = useUpdateHouseholdSettingsForm(createT, household, readOnly)
	const updateGeneralSettingsMutation = useGeneralSettingsSubmit(household, form)

	const handleSubmit = useCallback<Parameters<typeof form.handleSubmit>[0]>(
		(data: UpdateHouseholdSettingsInput) => {
			if (readOnly) {
				throw new Error('this form is read-only')
			}

			return updateGeneralSettingsMutation.mutateAsync(data)
		},
		[updateGeneralSettingsMutation],
	)

	return (
		<form id={formId} onSubmit={form.handleSubmit(handleSubmit)}>
			<SettingsSection
				title={tSections('general')}
				description={t('subtitle')}
				footer={
					!readOnly && (
						<div className='flex gap-2'>
							{form.formState.isDirty && (
								<Button variant='ghost' size='icon' type='reset' onClick={() => form.reset()}>
									<RotateCcwIcon />
								</Button>
							)}
							<ConfirmSaveButton formId={formId} disabled={!form.formState.isDirty} loading={form.formState.isSubmitting} />
						</div>
					)
				}
			>
				<Controller
					name='name'
					control={form.control}
					render={({ field, fieldState }) => (
						<Field data-invalid={!!fieldState.error}>
							<FieldLabel htmlFor={field.name} required>
								{t('name.label')}
							</FieldLabel>
							<Input
								{...field}
								minLength={MIN_HOUSEHOLD_NAME_LENGTH}
								maxLength={MAX_HOUSEHOLD_NAME_LENGTH}
								disabled={field.disabled || form.formState.isSubmitting}
							/>
							<FieldDescription>{t('name.description')}</FieldDescription>
							{fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
						</Field>
					)}
				/>

				<Controller
					name='currency'
					control={form.control}
					render={({ field, fieldState }) => (
						<Field data-invalid={!!fieldState.error}>
							<FieldLabel htmlFor={field.name} required>
								{t('currency.label')}
							</FieldLabel>
							<CurrencyCombobox
								value={field.value}
								name={field.name}
								onChange={field.onChange}
								disabled={field.disabled || form.formState.isSubmitting}
							/>
							<FieldDescription>{t('currency.description')}</FieldDescription>
							{fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
						</Field>
					)}
				/>

				<Controller
					name='splitStrategy'
					control={form.control}
					render={({ field }) => (
						<Field>
							<SplitStrategyLabel name={field.name} label={t('split-strategy.label')} />
							<SplitStrategyDropdown
								name={field.name}
								value={field.value}
								onChange={field.onChange}
								disabled={field.disabled || form.formState.isSubmitting}
								modal={false}
							/>
							<FieldDescription>{t('split-strategy.description')}</FieldDescription>
						</Field>
					)}
				/>

				<SwitchField
					control={form.control}
					name='autoCategorize'
					label={t('auto-categorize.label')}
					description={t('auto-categorize.description')}
					disabled={form.formState.isSubmitting}
				/>

				<SwitchField
					control={form.control}
					name='aiAssistEnabled'
					label={t('ai-assist.label')}
					description={t('ai-assist.description')}
					disabled={form.formState.isSubmitting}
				/>

				<Controller
					name='fullAddress'
					control={form.control}
					render={({ field, fieldState }) => (
						<Field data-invalid={!!fieldState.error}>
							<FieldLabel htmlFor={field.name}>{t('full-address.label')}</FieldLabel>
							<Input
								{...field}
								maxLength={MAX_HOUSEHOLD_FULL_ADDRESS_LENGTH}
								disabled={field.disabled || form.formState.isSubmitting}
							/>
							<FieldDescription>{t('full-address.description')}</FieldDescription>
							{fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
						</Field>
					)}
				/>

				{form.formState.errors.root && <FieldError>{form.formState.errors.root.message}</FieldError>}
			</SettingsSection>
		</form>
	)
}
