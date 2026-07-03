import { z } from 'zod'

export const MIN_HOUSEHOLD_NAME_LENGTH = 1
export const MAX_HOUSEHOLD_NAME_LENGTH = 50
export const createHouseholdSchema = z.object({
	// TODO: Add translations for error messages
	name: z
		.string()
		.trim()
		.min(MIN_HOUSEHOLD_NAME_LENGTH, 'Name is required')
		.max(MAX_HOUSEHOLD_NAME_LENGTH, `Name must be less than ${MAX_HOUSEHOLD_NAME_LENGTH} characters`),
})

export type CreateHouseholdInput = z.infer<typeof createHouseholdSchema>
