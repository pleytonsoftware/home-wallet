'use client'

import type { HouseholdDetail } from '@households/types'
import type { FC, PropsWithChildren } from 'react'

import { HouseholdProvider } from '@households/context/household.context'
import { getHouseholdOptions } from '@households/hooks/queries/get-household-option'
import { useQuery } from '@tanstack/react-query'

interface HouseholdContextProviderProps {
	id: string
	/** Server-fetched detail used to seed the query so `household` is never null. */
	initialData: HouseholdDetail
}

/**
 * Reads the hydrated single-household query and exposes it (plus a derived `isAdmin`)
 * to all descendant settings pages via {@link HouseholdProvider}.
 */
export const HouseholdContextProvider: FC<PropsWithChildren<HouseholdContextProviderProps>> = ({ id, initialData, children }) => {
	const { data, isLoading, isError } = useQuery({ ...getHouseholdOptions(id), initialData })

	const household = data ?? initialData

	return (
		<HouseholdProvider
			value={{
				household,
				role: household.role,
				isLoading,
				isError,
			}}
		>
			{children}
		</HouseholdProvider>
	)
}
