import { describe, expect, it } from 'vitest'

import { render } from '@testing-library/react'

import { Label } from './label'

describe('Label', () => {
	it('renders the label with the expected text and data-slot attribute', () => {
		const { getByText } = render(<Label>Test Label</Label>)
		const label = getByText('Test Label')

		expect(label).toBeInTheDocument()
		// Check if the data-slot attribute is present on the element
		expect(label.getAttribute('data-slot')).toBe('label')
	})

	it('forwards props like htmlFor', () => {
		const { getByText } = render(<Label htmlFor='input-id'>Test Label</Label>)
		const label = getByText('Test Label') as HTMLLabelElement

		expect(label.getAttribute('for')).toBe('input-id')
	})

	it('applies custom className', () => {
		const { getByText } = render(<Label className='custom-class'>Test Label</Label>)
		const label = getByText('Test Label')

		expect(label).toHaveClass('custom-class')
	})
})
