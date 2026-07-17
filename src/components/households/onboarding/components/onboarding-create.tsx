import type { CreateHouseholdConfigInput } from '@lib/schemas/household/create-household'

import { useRouter } from 'next/navigation'
import { useCallback, type FC } from 'react'

import { ChevronsUpDownIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Controller } from 'react-hook-form'

import { createHousehold } from '@actions/household/create'
import { Button } from '@atoms/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@atoms/collapsible'
import { Field, FieldDescription, FieldError, FieldLabel } from '@atoms/field'
import { Icon } from '@atoms/icon'
import { Input } from '@atoms/input'
import { useCreateHouseholdForm } from '@households/hooks/forms/use-create-household-form.hook'
import { OnboardingBody } from '@households/onboarding/components/onboarding-body'
import { ROUTES } from '@lib/constants/routes.const'
import { CurrencyCombobox } from '@molecules/currency-combobox'
import { SplitStrategyDropdown, SplitStrategyLabel } from '@molecules/split-strategy-dropdown'

export const OnboardingCreate: FC = () => {
	const t = useTranslations('common.forms.households.create')
	const onbCreateT = useTranslations('onboarding.create')
	const form = useCreateHouseholdForm(t)
	const router = useRouter()

	const handleCreateHousehold = useCallback<Parameters<typeof form.handleSubmit>[0]>(
		async (data) => {
			try {
				const res = await createHousehold(data.name)

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

				router.push(ROUTES.HOUSEHOLDS)
			} catch (err) {
				if (!form.formState.errors.root)
					form.setError('root', {
						type: 'manual',
						message: err instanceof Error ? err.message : t('error.generic'),
					})
			}
		},
		[router, t, form],
	)

	return (
		<OnboardingBody
			form={form}
			formControls={
				<>
					<Controller
						name='name'
						control={form.control}
						render={({ field, fieldState }) => (
							<>
								<Field>
									<FieldLabel htmlFor={field.name}>{t('name.label')}</FieldLabel>
									<Input
										disabled={form.formState.isSubmitting}
										{...field}
										type='text'
										placeholder={t('name.placeholder')}
										autoFocus
									/>
									<FieldDescription className='text-xs'>{t('name.description')}</FieldDescription>
								</Field>
								{fieldState.error && (
									<FieldError>
										<p className='text-sm font-medium text-destructive'>{fieldState.error.message}</p>
									</FieldError>
								)}
							</>
						)}
					/>
					<Collapsible className='flex flex-col gap-2'>
						<CollapsibleTrigger asChild>
							<Button variant='ghost' className='justify-between w-full'>
								{onbCreateT('customize')} <Icon IconComponent={ChevronsUpDownIcon} />
							</Button>
						</CollapsibleTrigger>
						<CollapsibleContent animate className='flex flex-col gap-4'>
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
											modal={false}
										/>
									</Field>
								)}
							/>
						</CollapsibleContent>
					</Collapsible>
				</>
			}
			handleSubmit={handleCreateHousehold}
			submitLabel={t('submit-button')}
		/>
	)
}
