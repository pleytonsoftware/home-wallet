'use client'

import type { BankAccountSummary } from '@bank-accounts/types'
import type { HouseholdMemberWithRole } from '@households/types'
import type { FC } from 'react'

import { useCallback, useMemo, type RefObject } from 'react'

import { useTranslations } from 'next-intl'
import { Controller } from 'react-hook-form'

import { Button } from '@atoms/button'
import { Field, FieldDescription, FieldError, FieldLabel } from '@atoms/field'
import { Input } from '@atoms/input'
import { AccountTypeDropdown } from '@bank-accounts/components/account-type-dropdown'
import { useBankAccountForm } from '@bank-accounts/hooks/forms/use-bank-account-form.hook'
import { useBankAccountSubmit } from '@bank-accounts/hooks/forms/use-bank-account-submit.hook'
import { useCurrentUser } from '@hooks/use-current-user'
import { useHouseholdContext } from '@households/context/household.context'
import { MemberAvatar } from '@molecules/member-avatar'
import { ResetFormButton } from '@molecules/reset-form-button'
import { TransferList } from '@molecules/transfer-list'

type SharedColumn = 'not-shared' | 'shared'

interface BankAccountFormProps {
	mode: 'create' | 'edit'
	bankAccount?: BankAccountSummary
	containerRef: RefObject<HTMLDivElement | null>
	onSuccess: () => void
}

export const BankAccountForm: FC<BankAccountFormProps> = ({ mode, bankAccount, containerRef, onSuccess }) => {
	const t = useTranslations('bank-accounts-page.form')
	const tSchema = useTranslations('common.forms.bank-accounts.create')
	const { household } = useHouseholdContext()
	const { user } = useCurrentUser()

	const form = useBankAccountForm({ mode, schemaParams: tSchema, initialData: bankAccount })
	const mutation = useBankAccountSubmit({ mode, householdId: household.id, bankAccountId: bankAccount?.id, form, onSuccess })

	const shareableMembers = useMemo(() => household.members.filter((member) => member.id !== user?.id), [household.members, user?.id])

	const handleSubmit = useCallback<Parameters<typeof form.handleSubmit>[0]>((data) => mutation.mutateAsync(data), [mutation])

	return (
		<form onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-1 flex-col gap-8 overflow-y-auto px-4 pb-4'>
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
				name='type'
				control={form.control}
				render={({ field }) => (
					<Field>
						<FieldLabel htmlFor={field.name}>{t('type.label')}</FieldLabel>
						<AccountTypeDropdown
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
				name='lastFourDigits'
				control={form.control}
				render={({ field, fieldState }) => (
					<Field data-invalid={!!fieldState.error}>
						<FieldLabel htmlFor={field.name}>{t('last-four-digits.label')}</FieldLabel>
						<Input
							{...field}
							value={field.value ?? ''}
							maxLength={4}
							inputMode='numeric'
							disabled={form.formState.isSubmitting}
							placeholder={t('last-four-digits.placeholder')}
						/>
						<FieldDescription>{t('last-four-digits.description')}</FieldDescription>
						{fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
					</Field>
				)}
			/>

			{shareableMembers.length > 0 && (
				<Controller
					name='sharedMemberIds'
					control={form.control}
					render={({ field }) => {
						const sharedIds = new Set(field.value ?? [])
						const assignments: Record<string, SharedColumn> = Object.fromEntries(
							shareableMembers.map((member) => [member.memberId, sharedIds.has(member.memberId) ? 'shared' : 'not-shared']),
						)

						return (
							<Field>
								<FieldLabel htmlFor={field.name}>{t('shared-members.label')}</FieldLabel>
								<FieldDescription>{t('shared-members.description')}</FieldDescription>
								<TransferList<HouseholdMemberWithRole, SharedColumn>
									items={shareableMembers}
									getItemId={(member) => member.memberId}
									assignments={assignments}
									onChange={(next) =>
										field.onChange(
											Object.entries(next)
												.filter(([, column]) => column === 'shared')
												.map(([id]) => id),
										)
									}
									leftColumn={{ key: 'not-shared', label: t('shared-members.not-shared') }}
									rightColumn={{ key: 'shared', label: t('shared-members.shared') }}
									disabled={form.formState.isSubmitting}
									renderItem={(member) => <BankAccountMemberRow member={member} />}
								/>
							</Field>
						)
					}}
				/>
			)}

			{form.formState.errors.root && <FieldError>{form.formState.errors.root.message}</FieldError>}

			<ResetFormButton formState={form.formState} reset={form.reset}>
				<Button type='submit' className='flex-1' disabled={!form.formState.isValid} loading={form.formState.isSubmitting}>
					{mode === 'create' ? t('submit-button.create') : t('submit-button.edit')}
				</Button>
			</ResetFormButton>
		</form>
	)
}

const BankAccountMemberRow: FC<{ member: HouseholdMemberWithRole }> = ({ member }) => (
	<>
		<MemberAvatar member={{ id: member.memberId, name: member.name, image: member.image }} />
		<span className='truncate'>{member.name}</span>
	</>
)
