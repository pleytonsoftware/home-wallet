import type { CreateHouseholdConfigInput } from '@lib/schemas/household/create-household'
import type { Dispatch, FC, SetStateAction } from 'react'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { useTranslations } from 'next-intl'
import { Controller } from 'react-hook-form'
import { toast } from 'sonner'

import { createHousehold } from '@actions/household/create'
import { Button } from '@atoms/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@atoms/field'
import { Input } from '@atoms/input'
import { Switch } from '@atoms/switch'
import { SplitStrategyDropdown, SplitStrategyLabel } from '@households/components/split-strategy-dropdown'
import { HOUSEHOLDS_QUERY_KEYS } from '@households/constants/query-keys'
import { useCreateHouseholdForm } from '@households/hooks/forms/use-create-household-form.hook'
import { CurrencyCombobox } from '@molecules/currency-combobox'
import { useQueryClient } from '@tanstack/react-query'

interface HouseholdCreateFormProps {
	setOpen: Dispatch<SetStateAction<boolean>>
	containerRef: React.RefObject<HTMLDivElement | null>
}

export const HouseholdCreateForm: FC<HouseholdCreateFormProps> = ({ setOpen, containerRef }) => {
	const t = useTranslations('common.forms.households.create')
	const form = useCreateHouseholdForm(t)
	const router = useRouter()
	const queryClient = useQueryClient()

	const handleCreateHousehold = useCallback<Parameters<typeof form.handleSubmit>[0]>(
		async (data: CreateHouseholdConfigInput) => {
			try {
				const res = await createHousehold(data.name, {
					currency: data.currency,
					splitStrategy: data.splitStrategy,
					autoCategorize: data.autoCategorize,
					fullAddress: data.fullAddress,
				})

				if (!res.success) {
					if (Array.isArray(res.error)) {
						res.error.forEach((issue) => {
							const path = (
								typeof issue.path[0] === 'string' ? issue.path[0] : issue.path[0].toString()
							) as keyof CreateHouseholdConfigInput
							form.setError(path, {
								type: issue.code,
								message: issue.message,
							})
						})
					} else {
						form.setError('root', {
							type: 'manual',
							message: res.error || t('error.generic'),
						})
					}
					throw new Error(Array.isArray(res.error) ? res.error.map((issue) => issue.message).join(', ') : res.error || t('error.generic'))
				}

				setOpen(false)
				await queryClient.invalidateQueries({
					queryKey: HOUSEHOLDS_QUERY_KEYS.households,
					exact: true,
				})
				form.reset()
				toast.success(t('success'))
				router.refresh()
			} catch (err) {
				if (!form.formState.errors.root)
					form.setError('root', {
						type: 'manual',
						message: err instanceof Error ? err.message : t('error.generic'),
					})
				toast.error(err instanceof Error ? err.message : t('error.generic'))
			}
		},
		[router, t, form],
	)

	return (
		<form onSubmit={form.handleSubmit(handleCreateHousehold)} className='flex flex-1 flex-col gap-8 overflow-y-auto px-4 pb-4'>
			<Controller
				name='name'
				control={form.control}
				render={({ field, fieldState }) => (
					<Field data-invalid={!!fieldState.error}>
						<FieldLabel htmlFor={field.name} required>
							{t('name.label')}
						</FieldLabel>
						<Input {...field} disabled={form.formState.isSubmitting} placeholder={t('name.placeholder')} autoFocus />
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
							disabled={form.formState.isSubmitting}
							container={containerRef}
						/>
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
							value={field.value!}
							onChange={field.onChange}
							disabled={form.formState.isSubmitting}
							container={containerRef.current}
							modal={false}
						/>
					</Field>
				)}
			/>
			<Controller
				name='autoCategorize'
				control={form.control}
				render={({ field }) => (
					<Field orientation='vertical'>
						<div className='flex items-center space-x-2.5'>
							<Switch
								name={field.name}
								defaultChecked={field.value}
								disabled={form.formState.isSubmitting}
								onCheckedChange={(checked) => field.onChange(checked)}
							/>
							<FieldLabel htmlFor={field.name}>{t('auto-categorize.label')}</FieldLabel>
						</div>
						<div>
							<FieldDescription>{t('auto-categorize.description')}</FieldDescription>
						</div>
					</Field>
				)}
			/>
			<Controller
				name='fullAddress'
				control={form.control}
				render={({ field, fieldState }) => (
					<Field data-invalid={!!fieldState.error}>
						<FieldLabel htmlFor={field.name}>{t('full-address.label')}</FieldLabel>
						<Input {...field} disabled={form.formState.isSubmitting} placeholder={t('full-address.placeholder')} />
						<FieldDescription>{t('full-address.description')}</FieldDescription>
						{fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
					</Field>
				)}
			/>
			{form.formState.errors.root && <FieldError>{form.formState.errors.root.message}</FieldError>}

			<Button type='submit' className='mt-2 w-full' disabled={!form.formState.isValid} loading={form.formState.isSubmitting}>
				{t('submit-button')}
			</Button>
		</form>
	)
}
