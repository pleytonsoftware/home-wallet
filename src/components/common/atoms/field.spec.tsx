import { describe, it, expect } from 'vitest'

import { render } from '@testing-library/react'

import { Field, FieldLabel, FieldDescription, FieldError, FieldGroup, FieldLegend, FieldSeparator, FieldSet, FieldContent, FieldTitle } from './field'

describe('Field', () => {
	it('renders a field with label, description and error', async () => {
		const { getByText, queryAllByRole } = render(
			<Field>
				<FieldLabel>Test label</FieldLabel>
				<FieldDescription>This is a description</FieldDescription>
				<FieldError errors={[{ message: 'Required' }]} />
			</Field>,
		)

		expect(getByText('Test label')).toBeInTheDocument()
		expect(getByText('This is a description')).toBeInTheDocument()
		// The error message should be rendered and have the role "alert"
		const alerts = queryAllByRole('alert')
		expect(alerts).toHaveLength(1)
		expect(alerts[0]).toHaveTextContent('Required')
	})

	it('deduplicates duplicate error messages', () => {
		const { getByText } = render(
			<FieldError errors={[{ message: 'A' }, { message: 'B' }, { message: 'A' }]} />, // duplicates
		)
		expect(getByText('A')).toBeInTheDocument()
		// There should be two list items – A and B
		const items = Array.from(document.querySelectorAll('ul > li'))
		expect(items).toHaveLength(2)
		expect(items.map((i) => i.textContent)).toContain('A')
		expect(items.map((i) => i.textContent)).toContain('B')
	})

	it('renders the Field as a group with correct data-slot attribute', () => {
		const { container } = render(<Field>Test</Field>)
		const div = container.querySelector('div[data-slot="field"]')
		expect(div).toBeInTheDocument()
	})

	it('renders FieldSet as fieldset with data-slot', () => {
		const { container } = render(<FieldSet data-testid='fs'>Content</FieldSet>)
		const fs = container.querySelector('fieldset[data-slot="field-set"]')
		expect(fs).toBeInTheDocument()
	})

	it('applies custom className to FieldGroup', () => {
		const { container } = render(
			<FieldGroup className='custom' data-testid='fg'>
				Group
			</FieldGroup>,
		)
		const fg = container.querySelector('div[data-slot="field-group"]') as HTMLElement
		expect(fg).toHaveClass('custom')
	})

	it('renders FieldLegend with the correct data-slot and variant', () => {
		const { container } = render(<FieldLegend variant='label'>Legend text</FieldLegend>)
		const legend = container.querySelector('legend[data-slot="field-legend"]') as HTMLElement
		expect(legend).toBeInTheDocument()
		expect(legend.dataset.variant).toBe('label')
	})

	it('renders FieldSeparator with optional content', () => {
		const { container } = render(<FieldSeparator>Sep</FieldSeparator>)
		const sep = container.querySelector('div[data-slot="field-separator"]') as HTMLElement
		expect(sep).toBeInTheDocument()
		const inner = container.querySelector('span[data-slot="field-separator-content"]')
		expect(inner).toHaveTextContent('Sep')
	})

	it('renders FieldContent wrapping children', () => {
		const { container } = render(<FieldContent>Some content</FieldContent>)
		const fc = container.querySelector('div[data-slot="field-content"]') as HTMLElement
		expect(fc).toBeInTheDocument()
		expect(fc).toHaveTextContent('Some content')
	})

	it('renders FieldTitle with correct text', () => {
		const { container } = render(<FieldTitle>Title</FieldTitle>)
		const ft = container.querySelector('div[data-slot="field-label"]') as HTMLElement
		expect(ft).toBeInTheDocument()
		expect(ft).toHaveTextContent('Title')
	})

	it('renders FieldLabel without required indicator by default', () => {
		const { container } = render(<FieldLabel>Email</FieldLabel>)
		const label = container.querySelector('[data-slot="field-label"]') as HTMLElement
		expect(label).toBeInTheDocument()
		expect(label).toHaveTextContent('Email')
		expect(label.querySelector('.text-destructive')).not.toBeInTheDocument()
	})

	it('renders required indicator when required=true', () => {
		const { container } = render(<FieldLabel required>Email</FieldLabel>)
		const label = container.querySelector('[data-slot="field-label"]') as HTMLElement
		expect(label).toHaveTextContent('Email *')
		const indicator = label.querySelector('.text-destructive')
		expect(indicator).toBeInTheDocument()
		expect(indicator).toHaveTextContent('*')
	})

	it('does not render required indicator when required=false', () => {
		const { container } = render(<FieldLabel required={false}>Email</FieldLabel>)
		const label = container.querySelector('[data-slot="field-label"]') as HTMLElement
		expect(label).toHaveTextContent('Email')
		expect(label.querySelector('.text-destructive')).not.toBeInTheDocument()
	})

	it('renders required indicator with destructive class', () => {
		const { container } = render(<FieldLabel required>Name</FieldLabel>)
		const indicator = container.querySelector('.text-destructive')
		expect(indicator).toBeInTheDocument()
		expect(indicator).toHaveClass('text-destructive')
	})
})
