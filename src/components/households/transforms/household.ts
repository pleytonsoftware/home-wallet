import type { HouseholdDetail, HouseholdSummary } from '@households/types'
import type { SplitStrategy } from '@lib/constants/split-strategy.enum'

export const transformHouseholdSummary = (rawHouseholdSummary: HouseholdSummary): HouseholdSummary => rawHouseholdSummary

export const transformHouseholdDetails = (rawHouseholdDetail: HouseholdDetail<true>): HouseholdDetail => ({
	...rawHouseholdDetail,
	...transformHouseholdSummary(rawHouseholdDetail),
	members: rawHouseholdDetail.members,
	config: {
		...rawHouseholdDetail.config,
		defaultSplitStrategy: rawHouseholdDetail.config.defaultSplitStrategy as SplitStrategy,
	},
})
