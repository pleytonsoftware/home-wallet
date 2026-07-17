import { UserGenderType } from '@/types/auth'

const GENDER_TO_AVATAR_PATH: Record<UserGenderType, string> = {
	[UserGenderType.male]: '/boy',
	[UserGenderType.female]: '/girl',
}

/**
 * Get a random unique avatar URL based on the user's email and optional gender.
 * @param email The email of the user.
 * @param gender The gender of the user ('male' or 'female').
 * @returns The URL of the generated avatar.
 */
export const getRandomUniqueAvatar = (email: string, gender?: UserGenderType): string => {
	const avatarId = email.split('@')[0]
	const genderPath = (gender && GENDER_TO_AVATAR_PATH[gender]) || ''

	const url = new URL(`https://avatarapi.runflare.run/public${genderPath}`)
	url.searchParams.set('username', avatarId)

	return url.toString()
}

/**
 * Get the initials from a given name.
 * @param name The full name of the user.
 * @returns The initials of the name.
 */
export const getInitials = (name: string): string =>
	name
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]!.toUpperCase())
		.join('')
