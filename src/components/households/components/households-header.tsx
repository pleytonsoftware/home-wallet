import type { FC, PropsWithChildren } from 'react'

import { Sparkles } from 'lucide-react'

import { PageHeader } from '@molecules/page-header'

interface HouseholdsHeaderProps {
	eyebrow: string
	title: string
	description: string
}

export const HouseholdsHeader: FC<PropsWithChildren<HouseholdsHeaderProps>> = ({ eyebrow, title, description }) => (
	<PageHeader icon={Sparkles} eyebrow={eyebrow} title={title} description={description} />
)
