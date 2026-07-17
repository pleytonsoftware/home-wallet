import type { FC } from 'react'

import { type Control, Controller } from 'react-hook-form'

import { Field, FieldError, FieldLabel } from '@atoms/field'
import { Input } from '@atoms/input'

interface JoinCodeFieldProps {
	control: Control<
		{
			code: string
		},
		unknown,
		{
			code: string
		}
	>
	disabled?: boolean
	label: string
	placeholder?: string
}

export const JoinCodeField: FC<JoinCodeFieldProps> = ({ control, disabled, label, placeholder }) => (
	<Controller
		name='code'
		control={control}
		render={({ field, fieldState }) => (
			<Field data-invalid={!!fieldState.error}>
				<FieldLabel htmlFor={field.name} required>
					{label}
				</FieldLabel>
				<Input
					{...field}
					onChange={(e) => field.onChange(e.target.value.toUpperCase())}
					disabled={disabled}
					placeholder={placeholder}
					autoFocus
				/>
				{fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
			</Field>
		)}
	/>
)
