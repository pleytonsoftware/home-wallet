import type { Prisma } from '@lib/prisma'

import { prisma } from '@lib/prisma'

export interface BankAccountTransferPlanEntry {
	accountId: string
	accountName: string
	action: 'transfer' | 'delete'
	transferTo?: {
		householdMemberId: string
		name: string
	}
	/** The `BankAccountMember` row id being promoted — needed to drop it from `sharedWith` once they become the owner. */
	sharedRowId?: string
}

/**
 * Resolves what should happen to every bank account owned by `householdMemberId` if that
 * membership is deactivated: accounts shared with another active member transfer ownership
 * to the longest-standing shared member, accounts with no other active member are deleted.
 */
export const getBankAccountTransferPlan = async (householdMemberId: string): Promise<BankAccountTransferPlanEntry[]> => {
	const ownedAccounts = await prisma.bankAccount.findMany({
		where: { householdMemberId },
		select: {
			id: true,
			name: true,
			sharedWith: {
				where: { householdMember: { removedAt: null } },
				orderBy: { createdAt: 'asc' },
				take: 1,
				select: {
					id: true,
					householdMemberId: true,
					householdMember: { select: { user: { select: { name: true } } } },
				},
			},
		},
	})

	return ownedAccounts.map((account) => {
		const nextOwner = account.sharedWith[0]

		if (!nextOwner) {
			return { accountId: account.id, accountName: account.name, action: 'delete' }
		}

		return {
			accountId: account.id,
			accountName: account.name,
			action: 'transfer',
			transferTo: { householdMemberId: nextOwner.householdMemberId, name: nextOwner.householdMember.user.name },
			sharedRowId: nextOwner.id,
		}
	})
}

/** Converts a transfer plan into the Prisma operations that apply it, for use inside a `$transaction`. */
export const planToPrismaOps = (plan: BankAccountTransferPlanEntry[]): Prisma.PrismaPromise<unknown>[] =>
	plan.map((entry) =>
		entry.action === 'transfer' && entry.transferTo && entry.sharedRowId
			? prisma.bankAccount.update({
					where: { id: entry.accountId },
					data: {
						householdMemberId: entry.transferTo.householdMemberId,
						sharedWith: { delete: { id: entry.sharedRowId } },
					},
				})
			: prisma.bankAccount.delete({ where: { id: entry.accountId } }),
	)
