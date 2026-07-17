'use client'

import type { FC } from 'react'
import type { HouseholdsPageProps } from './types'

import { useTranslations } from 'next-intl'

import { HouseholdJoinBanner } from '@households/components/household-join-banner'
import { HouseholdsGrid } from '@households/components/households-grid'
import { HouseholdsHeader } from '@households/components/households-header'
import { HouseholdsProvider } from '@households/context/households.context'
import { getHouseholdsOptions } from '@households/hooks/queries/get-households-option'
import { useQuery } from '@tanstack/react-query'

export const HouseholdsPage: FC<HouseholdsPageProps> = (props) => {
	const t = useTranslations('households-page')
	const { data, isLoading, isError } = useQuery(getHouseholdsOptions())

	return (
		<HouseholdsProvider
			value={{
				...props,
				households: data || [],
				isLoading,
				isError,
			}}
		>
			<div className='mx-auto flex w-full flex-col gap-6 py-4 px-4 sm:px-0'>
				<HouseholdsHeader eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />
				<HouseholdsGrid />
				<HouseholdJoinBanner title={t('join-banner.title')} description={t('join-banner.description')} cta={t('join-banner.cta')} />
			</div>
		</HouseholdsProvider>
	)
}
