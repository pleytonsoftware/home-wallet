import { useForm } from 'react-hook-form'

import { magicLinkResolver } from '@auth/magic-link.schema'

export const useMagicLinkForm = () =>
	useForm({
		resolver: magicLinkResolver,
		defaultValues: {
			email: '',
		},
	})
