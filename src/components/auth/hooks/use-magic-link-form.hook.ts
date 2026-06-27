import { useForm } from 'react-hook-form'

import { magicLinkResolver } from '../magic-link.schema'

export const useMagicLinkForm = () =>
	useForm({
		resolver: magicLinkResolver,
		defaultValues: {
			email: '',
		},
	})
