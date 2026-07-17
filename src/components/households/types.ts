import type { MemberRole } from '@lib/constants/role.enum'

export interface HouseholdMemberSummary {
	id: string
	name: string
	image?: string | null
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
