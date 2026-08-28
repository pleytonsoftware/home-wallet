import type { RefObject } from 'react'

import { createContext, useContext } from 'react'

const TransactionFormContainerContext = createContext<RefObject<HTMLDivElement | null> | undefined>(undefined)

export const TransactionFormContainerProvider = TransactionFormContainerContext.Provider

/** The transaction sheet's portal container, for comboboxes/dropdowns rendered inside it. */
export const useTransactionFormContainer = () => {
	const context = useContext(TransactionFormContainerContext)
	if (!context) {
		throw new Error('useTransactionFormContainer must be used within a TransactionFormContainerProvider')
	}
	return context
}
