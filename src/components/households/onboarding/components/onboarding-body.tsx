/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from 'react'
import type { FieldValues, UseFormReturn } from 'react-hook-form'

import { useTranslations } from 'next-intl'

import { Button } from '@atoms/button'
import { FieldError } from '@atoms/field'
import { useOnboardingContext } from '@households/onboarding/context/onboarding.context'

interface OnboardingBodyProps<TFieldValues extends FieldValues = FieldValues, TContext = any, TTransformedValues = TFieldValues> {
	form: UseFormReturn<TFieldValues, TContext, TTransformedValues>
	handleSubmit: Parameters<UseFormReturn<TFieldValues, TContext, TTransformedValues>['handleSubmit']>[0]
	formControls: ReactNode
	submitLabel: string
}

export const OnboardingBody = <TFieldValues extends FieldValues = FieldValues, TContext = any, TTransformedValues = TFieldValues>({
	handleSubmit,
	form,
	formControls,
	submitLabel,
}: OnboardingBodyProps<TFieldValues, TContext, TTransformedValues>) => {
	const t = useTranslations('onboarding')
	const { view, setView, onToggleView } = useOnboardingContext()
	return (
		<div className='space-y-4'>
			<form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-4 rounded-lg border bg-card p-6 shadow-sm'>
				{formControls}

				{form.formState.errors.root && <FieldError>{form.formState.errors.root.message}</FieldError>}

				<Button type='submit' disabled={!form.formState.isValid} className='w-full' loading={form.formState.isSubmitting}>
					{submitLabel}
				</Button>
			</form>

			<div className='text-center text-sm'>
				<button
					onClick={() => {
						setView((previous) => (previous === 'create' ? 'join' : 'create'))
						onToggleView?.()
					}}
					className='text-primary hover:underline underline-offset-4'
				>
					{view === 'create' ? t('create.invite-code') : t('join.create-new')}
				</button>
			</div>
		</div>
	)
}
