import { createContext, useContext } from 'react'

import { HouseholdsPageProps } from '../types'

interface HouseholdsContextType extends HouseholdsPageProps {
	isLoading?: boolean
	isError?: boolean
}

const HouseholdsContext = createContext<HouseholdsContextType | undefined>(undefined)

export const HouseholdsProvider = HouseholdsContext.Provider
export const HouseholdsConsumer = HouseholdsContext.Consumer
export const useHouseholdsContext = () => {
	const context = useContext(HouseholdsContext)
	if (!context) {
		throw new Error('useHouseholdsContext must be used within a HouseholdsProvider')
	}
	return context
}
