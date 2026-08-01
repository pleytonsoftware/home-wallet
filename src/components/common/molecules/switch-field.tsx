import type { FieldPath, Control, FieldValues } from 'react-hook-form'

import { Controller } from 'react-hook-form'

import { Field, FieldLabel, FieldDescription } from '@atoms/field'
import { Switch } from '@atoms/switch'

type SwitchFieldProps<
	TFieldValues extends FieldValues = FieldValues,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TContext = any,
	TTransformedValues = TFieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
	name: TName
	label: string
	description: string
	disabled: boolean
	control: Control<TFieldValues, TContext, TTransformedValues>
}

export const SwitchField = <
	TFieldValues extends FieldValues = FieldValues,
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	TContext = any,
	TTransformedValues = TFieldValues,
	TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
	name,
	label,
	description,
	disabled,
	control,
}: SwitchFieldProps<TFieldValues, TContext, TTransformedValues, TName>) => (
	<Controller
		name={name}
		control={control}
		render={({ field }) => (
			<Field orientation='vertical'>
				<div className='flex items-center space-x-2.5'>
					<Switch name={field.name} checked={field.value} disabled={field.disabled || disabled} onCheckedChange={field.onChange} />
					<FieldLabel htmlFor={field.name}>{label}</FieldLabel>
				</div>
				<FieldDescription>{description}</FieldDescription>
			</Field>
		)}
	/>
)
