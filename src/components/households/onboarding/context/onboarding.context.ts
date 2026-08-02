import type { OnboardingOption } from '@households/onboarding/types'
import type { Dispatch, SetStateAction } from 'react'

import { createContext, useContext } from 'react'

interface OnboardingContextType {
	view: OnboardingOption
	setView: Dispatch<SetStateAction<OnboardingOption>>
	onToggleView?: () => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export const OnboardingProvider = OnboardingContext.Provider
export const OnboardingConsumer = OnboardingContext.Consumer
export const useOnboardingContext = () => {
	const context = useContext(OnboardingContext)
	if (!context) {
		throw new Error('useOnboardingContext must be used within an OnboardingProvider')
	}
	return context
}
