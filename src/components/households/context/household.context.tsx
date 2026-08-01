import type { HouseholdDetail } from '@households/types'

import { createContext, useContext, useMemo } from 'react'

import { MemberRole } from '@lib/constants/role.enum'

export interface HouseholdContextType {
	household: HouseholdDetail
	role: MemberRole
	isLoading?: boolean
	isError?: boolean
}

type HouseholdContextTypeReturn = HouseholdContextType & {
	/** Whether the current user is an admin of this household. */
	isAdmin: boolean
}

const HouseholdContext = createContext<HouseholdContextTypeReturn | undefined>(undefined)

type HouseholdProviderProps = Omit<React.ComponentProps<typeof HouseholdContext.Provider>, 'value'> & {
	value?: HouseholdContextType
}

export const HouseholdProvider = ({ value, ...props }: HouseholdProviderProps) => {
	// Memoize this computed value to avoid unexpected re-renders
	const contextValue = useMemo<HouseholdContextTypeReturn | undefined>(
		() => (value ? { ...value, isAdmin: value.role === MemberRole.ADMIN } : undefined),
		[value],
	)

	return <HouseholdContext.Provider value={contextValue} {...props} />
}

export const useHouseholdContext = () => {
	const context = useContext(HouseholdContext)
	if (!context) {
		throw new Error('useHouseholdContext must be used within a HouseholdContextProvider')
	}
	return context
}
