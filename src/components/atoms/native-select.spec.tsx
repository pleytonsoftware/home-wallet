import { render, screen, fireEvent } from '@testing-library/react'

import { NativeSelect, NativeSelectOptGroup, NativeSelectOption } from './native-select'

describe('NativeSelect', () => {
	it('renders with data-slot', () => {
		render(<NativeSelect data-testid='select' />)
		expect(screen.getByTestId('select')).toHaveAttribute('data-slot', 'native-select')
	})

	it('renders as a select element', () => {
		render(<NativeSelect data-testid='select' />)
		expect(screen.getByTestId('select').tagName).toBe('SELECT')
	})

	it('renders the wrapper with data-slot and default size', () => {
		render(<NativeSelect data-testid='select' />)
		const wrapper = screen.getByTestId('select').parentElement
		expect(wrapper).toHaveAttribute('data-slot', 'native-select-wrapper')
		expect(wrapper).toHaveAttribute('data-size', 'default')
	})

	it('applies the size prop to the wrapper and select', () => {
		render(<NativeSelect data-testid='select' size='sm' />)
		const el = screen.getByTestId('select')
		expect(el).toHaveAttribute('data-size', 'sm')
		expect(el.parentElement).toHaveAttribute('data-size', 'sm')
	})

	it('applies default classes', () => {
		render(<NativeSelect data-testid='select' />)
		const el = screen.getByTestId('select')
		expect(el).toHaveClass('h-9', 'w-full', 'appearance-none', 'rounded-md', 'border', 'border-input')
	})

	it('merges custom className onto the wrapper', () => {
		render(<NativeSelect data-testid='select' className='custom-class' />)
		expect(screen.getByTestId('select').parentElement).toHaveClass('custom-class', 'group/native-select')
	})

	it('renders the chevron icon', () => {
		const { container } = render(<NativeSelect />)
		expect(container.querySelector('[data-slot="native-select-icon"]')).toBeInTheDocument()
	})

	it('handles value change', () => {
		render(
			<NativeSelect data-testid='select' defaultValue='a'>
				<NativeSelectOption value='a'>A</NativeSelectOption>
				<NativeSelectOption value='b'>B</NativeSelectOption>
			</NativeSelect>,
		)
		const el = screen.getByTestId('select')
		fireEvent.change(el, { target: { value: 'b' } })
		expect(el).toHaveValue('b')
	})

	it('can be disabled', () => {
		render(<NativeSelect data-testid='select' disabled />)
		expect(screen.getByTestId('select')).toBeDisabled()
	})

	it('spreads additional select props', () => {
		render(<NativeSelect data-testid='select' name='fruit' required />)
		const el = screen.getByTestId('select')
		expect(el).toHaveAttribute('name', 'fruit')
		expect(el).toBeRequired()
	})

	it('renders with aria-invalid', () => {
		render(<NativeSelect data-testid='select' aria-invalid />)
		expect(screen.getByTestId('select')).toHaveAttribute('aria-invalid', 'true')
	})
})

describe('NativeSelectOption', () => {
	it('renders with data-slot', () => {
		render(
			<select>
				<NativeSelectOption value='a' data-testid='option'>
					A
				</NativeSelectOption>
			</select>,
		)
		expect(screen.getByTestId('option')).toHaveAttribute('data-slot', 'native-select-option')
	})

	it('renders as an option element', () => {
		render(
			<select>
				<NativeSelectOption value='a' data-testid='option'>
					A
				</NativeSelectOption>
			</select>,
		)
		expect(screen.getByTestId('option').tagName).toBe('OPTION')
	})

	it('merges custom className', () => {
		render(
			<select>
				<NativeSelectOption value='a' data-testid='option' className='custom-class'>
					A
				</NativeSelectOption>
			</select>,
		)
		expect(screen.getByTestId('option')).toHaveClass('custom-class', 'bg-[Canvas]')
	})
})

describe('NativeSelectOptGroup', () => {
	it('renders with data-slot', () => {
		render(
			<select>
				<NativeSelectOptGroup label='Group' data-testid='optgroup' />
			</select>,
		)
		expect(screen.getByTestId('optgroup')).toHaveAttribute('data-slot', 'native-select-optgroup')
	})

	it('renders as an optgroup element', () => {
		render(
			<select>
				<NativeSelectOptGroup label='Group' data-testid='optgroup' />
			</select>,
		)
		expect(screen.getByTestId('optgroup').tagName).toBe('OPTGROUP')
	})

	it('merges custom className', () => {
		render(
			<select>
				<NativeSelectOptGroup label='Group' data-testid='optgroup' className='custom-class' />
			</select>,
		)
		expect(screen.getByTestId('optgroup')).toHaveClass('custom-class', 'bg-[Canvas]')
	})
})
