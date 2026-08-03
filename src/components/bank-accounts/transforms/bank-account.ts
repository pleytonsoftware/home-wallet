import type { BankAccountSummary } from '@bank-accounts/types'
import type { ACCOUNT_TYPE } from '@lib/constants/account.enum'

export const transformBankAccountSummary = (raw: BankAccountSummary): BankAccountSummary => ({
	...raw,
	type: raw.type as ACCOUNT_TYPE,
})
