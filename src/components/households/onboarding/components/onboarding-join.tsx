import type { JoinHouseholdInput } from '@lib/schemas/household/join-household'

import { useRouter } from 'next/navigation'
import { useCallback, type FC } from 'react'

import { StatusCodes } from 'http-status-codes'
import { useTranslations } from 'next-intl'

import { joinHousehold } from '@actions/household/join'
import { JoinCodeField } from '@households/components/household-join/join-code-field'
import { useJoinHouseholdForm } from '@households/hooks/forms/use-join-household-form.hook'
import { OnboardingBody } from '@households/onboarding/components/onboarding-body'
import { ROUTES } from '@lib/constants/routes.const'

export const OnboardingJoin: FC = () => {
	const t = useTranslations('onboarding.join.form')
	const form = useJoinHouseholdForm(t)
	const router = useRouter()

	const handleJoinHousehold = useCallback<Parameters<typeof form.handleSubmit>[0]>(
		async (data) => {
			try {
				const res = await joinHousehold(data.code)

				if (!res.success) {
					if (Array.isArray(res.error)) {
						res.error.forEach((issue) => {
							const path = (typeof issue.path[0] === 'string' ? issue.path[0] : issue.path[0].toString()) as keyof JoinHouseholdInput
							form.setError(path, {
								type: issue.code,
								message: issue.message,
							})
						})
					} else {
						form.setError('root', {
							type: 'manual',
							message: res.status === StatusCodes.NOT_FOUND ? t('error.not-found') : t('error.generic'),
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
				<JoinCodeField
					control={form.control}
					disabled={form.formState.isSubmitting}
					label={t('invite-code.label')}
					placeholder={t('invite-code.placeholder')}
				/>
			}
			handleSubmit={handleJoinHousehold}
			submitLabel={t('submit-button')}
		/>
	)
}
