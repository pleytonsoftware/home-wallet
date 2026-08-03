import type { ACCOUNT_TYPE } from '@lib/constants/account.enum'

export interface BankAccountMemberSummary {
	/** `HouseholdMember.id` — the membership row id (not the user id). */
	id: string
	name: string
	image?: string | null
}

/**
 * A bank account as seen by the current user: only visible to its creator/owner and the
 * members it's shared with. Only the owner may edit or delete it.
 */
export interface BankAccountSummary {
	id: string
	householdId: string
	name: string
	type: ACCOUNT_TYPE
	lastFourDigits?: string | null
	/** Whether the current user is the creator/owner of this account. */
	isOwner: boolean
	owner: BankAccountMemberSummary
	sharedWith: Array<BankAccountMemberSummary>
	createdAt: string
}

export interface CreateBankAccountPayload {
	name: string
	type: ACCOUNT_TYPE
	lastFourDigits?: string
	sharedMemberIds: Array<string>
}

export type UpdateBankAccountPayload = CreateBankAccountPayload
