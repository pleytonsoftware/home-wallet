import type { HouseholdDetail, HouseholdSummary } from '@households/types'

export const transformHouseholdSummary = (rawHouseholdSummary: HouseholdSummary): HouseholdSummary => rawHouseholdSummary

export const transformHouseholdDetails = (rawHouseholdDetail: HouseholdDetail): HouseholdDetail => ({
	...rawHouseholdDetail,
	...transformHouseholdSummary(rawHouseholdDetail),
	members: rawHouseholdDetail.members,
})
