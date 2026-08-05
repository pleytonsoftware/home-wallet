'use client'

import type { HouseholdMemberWithRole } from '@households/types'
import type { FC } from 'react'

import { useCallback, useMemo } from 'react'

import { useTranslations } from 'next-intl'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { Button } from '@atoms/button'
import { FieldError } from '@atoms/field'
import { useCurrentUser } from '@hooks/use-current-user'
import { MemberItem } from '@households/components/household-settings/member-item'
import { RemoveMemberButton } from '@households/components/household-settings/remove-member-button'
import { SettingsSection } from '@households/components/household-settings/settings-section'
import { useHouseholdContext } from '@households/context/household.context'
import { useSaveMemberRoles } from '@households/hooks/forms/use-save-member-roles.hook'
import { MemberRole } from '@lib/constants/role.enum'
import { ResetFormButton } from '@molecules/reset-form-button'
import { TransferList } from '@molecules/transfer-list'

interface RolesFormValues {
	assignments: Record<string, MemberRole>
}

const buildAssignments = (members: HouseholdMemberWithRole[]): Record<string, MemberRole> =>
	Object.fromEntries(members.map((member) => [member.memberId, member.role]))

export const RolesTransferList: FC = () => {
	const t = useTranslations('settings.members')
	const tMembers = useTranslations('common.fields.roles.members')
	const { household, isAdmin } = useHouseholdContext()
	const { user } = useCurrentUser()

	const currentUserId = user?.id
	const initialAssignments = useMemo(() => buildAssignments(household.members), [household.members])

	const form = useForm<RolesFormValues>({
		defaultValues: { assignments: initialAssignments },
	})

	const assignments = useWatch({ control: form.control, name: 'assignments' })
	const hasAdmins = useMemo(() => Object.values(assignments ?? {}).some((role) => role === MemberRole.ADMIN), [assignments])

	const saveMemberRolesMutation = useSaveMemberRoles(household, form)

	const handleSubmit = useCallback<Parameters<typeof form.handleSubmit>[0]>(
		(data) => hasAdmins && saveMemberRolesMutation.mutateAsync(data.assignments),
		[saveMemberRolesMutation],
	)

	const rootError = !hasAdmins ? t('last-admin-error') : form.formState.errors.root?.message

	if (!isAdmin) return null

	return (
		<form onSubmit={form.handleSubmit(handleSubmit)}>
			<SettingsSection
				title={t('title')}
				description={t('subtitle')}
				help={
					<div className='flex flex-col gap-1'>
						<p className='font-medium'>{t('help.title')}</p>
						<p className='text-muted-foreground'>{t('help.body')}</p>
					</div>
				}
				footer={
					<ResetFormButton formState={form.formState} reset={form.reset}>
						<Button type='submit' disabled={!form.formState.isDirty || !hasAdmins} loading={form.formState.isSubmitting}>
							{t('save')}
						</Button>
					</ResetFormButton>
				}
			>
				<Controller
					control={form.control}
					name='assignments'
					render={({ field }) => (
						<TransferList<HouseholdMemberWithRole, MemberRole>
							items={household.members}
							getItemId={(member) => member.memberId}
							assignments={field.value}
							onChange={field.onChange}
							leftColumn={{ key: MemberRole.MEMBER, label: tMembers('member') }}
							rightColumn={{ key: MemberRole.ADMIN, label: tMembers('admin') }}
							isItemDisabled={(member) => member.id === currentUserId}
							renderItem={(member) => <MemberItem member={member} />}
							renderItemAction={(member) =>
								member.id !== currentUserId && (
									<RemoveMemberButton householdId={household.id} memberId={member.memberId} memberName={member.name} />
								)
							}
						/>
					)}
				/>

				{rootError && <FieldError>{rootError}</FieldError>}
			</SettingsSection>
		</form>
	)
}
