import { z } from 'zod'

import { zodResolver } from '@hookform/resolvers/zod'

export const magicLinkSchema = z.object({
	email: z.email('Invalid email address'),
})

export const magicLinkResolver = zodResolver(magicLinkSchema)
