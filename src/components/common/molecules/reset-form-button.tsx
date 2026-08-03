import type { ReactNode } from 'react'
import type { UseFormReset, FieldValues, UseFormStateReturn } from 'react-hook-form'
import type { EmptyObject } from 'type-fest'

import { RotateCcwIcon } from 'lucide-react'

import { Button } from '@atoms/button'

interface ResetFormButtonProps<T extends FieldValues = EmptyObject> {
	formState: UseFormStateReturn<T>
	reset: () => void | UseFormReset<T>
	children?: ReactNode
}

export const ResetFormButton = <T extends FieldValues = EmptyObject>({ formState, reset, children }: ResetFormButtonProps<T>) => {
	return (
		<div className='flex gap-2'>
			{formState.isDirty && (
				<Button variant='ghost' size='icon' type='reset' onClick={() => reset()}>
					<RotateCcwIcon />
				</Button>
			)}
			{children}
		</div>
	)
}
