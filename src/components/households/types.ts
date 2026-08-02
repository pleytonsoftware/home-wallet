import type { TransformField } from '@/lib/types/raw/types'
import type { MemberRole } from '@lib/constants/role.enum'
import type { SplitStrategy } from '@lib/constants/split-strategy.enum'

export interface HouseholdMemberSummary {
	/** `User.id` - the user `id` of the household member. */
	id: string
	name: string
	image?: string | null
}

/** A household member enriched with membership metadata (role + membership id). */
export interface HouseholdMemberWithRole extends HouseholdMemberSummary {
	/** `HouseholdMember.id` — the membership row id (distinct from the user `id`). */
	memberId: string
	email: string
	role: MemberRole
}

/** Editable household configuration mirrored from the `HouseholdConfig` model. */
export interface HouseholdConfigSummary<R extends boolean = false> {
	currency: string
	defaultSplitStrategy: TransformField<SplitStrategy, string, R>
	autoCategorize: boolean
	aiAssistEnabled: boolean
}

export interface HouseholdSummary {
	id: string
	name: string
	/** Invite code for the household. Only returned if the user is an admin of the household. */
	code?: string
	role: MemberRole
	/** Whether this is the currently selected/active household. Not yet backed by persisted state. */
	isActive?: boolean
	members: Array<HouseholdMemberSummary>

	/** Household balance (income - spent). Defaults to 0 until the split/budget engine is wired in. */
	balance: number
	/** Total household income for the current month. Defaults to 0 until the split/budget engine is wired in. */
	income: number
	/** Total household spend for the current month. Defaults to 0 until the split/budget engine is wired in. */
	spent: number
	currency?: string
}

export interface HouseholdsPageProps {
	households: Array<HouseholdSummary>
}

/**
 * A single household with the full detail needed by the settings pages:
 * editable config, members with their roles, and the full address.
 */
export interface HouseholdDetail<R extends boolean = false> extends Omit<HouseholdSummary, 'members'> {
	fullAddress?: string | null
	/** Whether the current user created (owns) this household. Only the owner may delete it. */
	isOwner: boolean
	config: HouseholdConfigSummary<R>
	members: Array<HouseholdMemberWithRole>
	isInviteCodeOnCooldown: boolean
}
