'use client'

import { Fragment, useMemo, useRef, type FC } from 'react'

import { CircleQuestionMarkIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useBoolean, useOnClickOutside } from 'usehooks-ts'

import { FieldLabel } from '@atoms/field'
import { Icon } from '@atoms/icon'
import { Separator } from '@atoms/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@atoms/tooltip'
import { useIsNativeMobile } from '@hooks/use-native-mobile'
import { SplitStrategy } from '@lib/constants/split-strategy.enum'
import { EnumDropdown, type EnumDropdownProps } from '@molecules/enum-dropdown'

const SPLIT_STRATEGIES = Object.values(SplitStrategy)

interface SplitStrategyLabelProps {
	name: string
	label: string
}

type SplitStrategyDropdownProps = Omit<EnumDropdownProps<SplitStrategy>, 'values' | 'getLabel' | 'renderTrigger' | 'renderOption'>

export const mapSplitStrategyToTranslations = (t: ReturnType<typeof useTranslations<'common.fields.split-strategy'>>) =>
	({
		[SplitStrategy.EQUAL]: {
			name: t('options.equal.name'),
			description: t('options.equal.description'),
		},
		[SplitStrategy.PROPORTIONAL_TO_INCOME]: {
			name: t('options.proportional_to_income.name'),
			description: t('options.proportional_to_income.description'),
		},
		[SplitStrategy.CUSTOM_PERCENTAGES]: {
			name: t('options.custom_percentages.name'),
			description: t('options.custom_percentages.description'),
		},
		[SplitStrategy.ROUND_ROBIN]: {
			name: t('options.round_robin.name'),
			description: t('options.round_robin.description'),
		},
		[SplitStrategy.CUSTOM_AMOUNTS]: {
			name: t('options.custom_amounts.name'),
			description: t('options.custom_amounts.description'),
		},
	}) as const

export const SplitStrategyLabel: FC<SplitStrategyLabelProps> = ({ name, label }) => {
	const t = useTranslations('common.fields.split-strategy')
	const { value: isOpen, setTrue: openTooltip, setFalse: closeTooltip } = useBoolean(false)
	const isNativeMobile = useIsNativeMobile()
	const tooltipRef = useRef<HTMLDivElement>(undefined!)
	useOnClickOutside(tooltipRef, closeTooltip)
	const options = useMemo(() => mapSplitStrategyToTranslations(t), [t])

	return (
		<FieldLabel htmlFor={name}>
			{label}
			{isNativeMobile && (
				<>
					{' '}
					<Tooltip open={isOpen}>
						<TooltipTrigger
							asChild
							onClick={(e) => {
								e.preventDefault()
								openTooltip()
							}}
						>
							<Icon IconComponent={CircleQuestionMarkIcon} size='xs' className='hover:cursor-pointer' />
						</TooltipTrigger>
						<TooltipContent side='bottom' className='flex w-[95vw] mr-2 max-w-lg flex-col gap-2 text-xs py-4 px-3' ref={tooltipRef}>
							{Object.entries(options).map(([key, value], index, array) => (
								<Fragment key={key}>
									<dl className='flex w-full items-start justify-between gap-4'>
										<dt className='font-bold w-1/3'>{value.name}</dt>
										<Separator className='my-1' orientation='vertical' />
										<dd className='text-muted w-2/3'>{value.description}</dd>
									</dl>
									{index < array.length - 1 && <Separator className='my-1' />}
								</Fragment>
							))}
						</TooltipContent>
					</Tooltip>
				</>
			)}
		</FieldLabel>
	)
}

const SplitStrategyOption: FC<{ option: ReturnType<typeof mapSplitStrategyToTranslations>[SplitStrategy] }> = ({ option }) => (
	<Tooltip>
		<TooltipTrigger asChild>
			<span className='block w-full truncate'>{option.name}</span>
		</TooltipTrigger>
		<TooltipContent side='left'>
			<p>{option.description}</p>
		</TooltipContent>
	</Tooltip>
)

export const SplitStrategyDropdown: FC<SplitStrategyDropdownProps> = (props) => {
	const t = useTranslations('common.fields.split-strategy')
	const options = useMemo(() => mapSplitStrategyToTranslations(t), [t])

	return (
		<EnumDropdown
			{...props}
			values={SPLIT_STRATEGIES}
			getLabel={(strategy) => options[strategy].name}
			renderOption={(strategy) => <SplitStrategyOption option={options[strategy]} />}
		/>
	)
}
