'use client'

import type { ComponentProps, FC } from 'react'

import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@atoms/input-group'
import { getCurrencySymbol } from '@households/utils'

interface CurrencyInputProps extends Omit<ComponentProps<typeof InputGroupInput>, 'type'> {
	currency: string
	locale?: string
}

export const CurrencyInput: FC<CurrencyInputProps> = ({ currency, locale, className, ...props }) => (
	<InputGroup className={className}>
		<InputGroupAddon>
			<InputGroupText>{getCurrencySymbol(currency, locale)}</InputGroupText>
		</InputGroupAddon>
		<InputGroupInput type='number' inputMode='decimal' step='0.01' min={0} {...props} />
	</InputGroup>
)
