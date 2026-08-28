import type { BankAccountSummary } from './types'

/** Plain-text "Name · •••• 1234" label, also used for contexts that can't render icons (e.g. a native `<select>`). */
export const formatBankAccountLabel = ({ name, lastFourDigits }: Pick<BankAccountSummary, 'name' | 'lastFourDigits'>): string =>
	lastFourDigits ? `${name} · •••• ${lastFourDigits}` : name
