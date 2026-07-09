import { render, screen } from '@testing-library/react'

import {
	Combobox,
	ComboboxChip,
	ComboboxChips,
	ComboboxChipsInput,
	ComboboxCollection,
	ComboboxContent,
	ComboboxEmpty,
	ComboboxGroup,
	ComboboxInput,
	ComboboxItem,
	ComboboxLabel,
	ComboboxList,
	ComboboxSeparator,
	ComboboxTrigger,
} from './combobox'

describe('ComboboxTrigger', () => {
	it('renders with data-slot attribute', () => {
		render(
			<Combobox>
				<ComboboxTrigger data-testid='trigger'>Open</ComboboxTrigger>
			</Combobox>,
		)
		expect(screen.getByTestId('trigger')).toHaveAttribute('data-slot', 'combobox-trigger')
	})

	it('renders children', () => {
		render(
			<Combobox>
				<ComboboxTrigger>Trigger</ComboboxTrigger>
			</Combobox>,
		)
		expect(screen.getByText('Trigger')).toBeInTheDocument()
	})

	it('renders chevron down icon', () => {
		render(
			<Combobox>
				<ComboboxTrigger data-testid='trigger'>Open</ComboboxTrigger>
			</Combobox>,
		)
		const trigger = screen.getByTestId('trigger')
		const svg = trigger.querySelector('svg')
		expect(svg).toBeInTheDocument()
	})
})

describe('ComboboxInput', () => {
	it('renders with input element', () => {
		render(
			<Combobox>
				<ComboboxInput data-testid='input' />
			</Combobox>,
		)
		expect(screen.getByTestId('input')).toBeInTheDocument()
	})

	it('hides trigger when showTrigger is false', () => {
		const { container } = render(
			<Combobox>
				<ComboboxInput data-testid='input' showTrigger={false} />
			</Combobox>,
		)
		// With showTrigger=false, no trigger button should be rendered
		const triggers = container.querySelectorAll('[data-slot="combobox-trigger"]')
		expect(triggers.length).toBe(0)
	})

	it('respects disabled prop', () => {
		render(
			<Combobox>
				<ComboboxInput data-testid='input' disabled={true} />
			</Combobox>,
		)
		const input = screen.getByTestId('input')
		expect(input).toBeDisabled()
	})

	it('accepts custom className', () => {
		render(
			<Combobox>
				<ComboboxInput data-testid='input' className='custom-class' />
			</Combobox>,
		)
		const inputGroup = screen.getByTestId('input').closest('[data-slot="input-group"]')
		expect(inputGroup).toHaveClass('custom-class')
	})
})

describe('ComboboxContent', () => {
	it('renders content popup when combobox is open', () => {
		render(
			<Combobox defaultOpen>
				<ComboboxInput />
				<ComboboxContent />
			</Combobox>,
		)
		// Portal might render outside of container, so check document
		const content = document.querySelector('[data-slot="combobox-content"]')
		expect(content).toBeInTheDocument()
	})
})

describe('ComboboxList', () => {
	it('renders with data-slot attribute', () => {
		const { container } = render(
			<Combobox open>
				<ComboboxList data-testid='list' />
			</Combobox>,
		)
		expect(container.querySelector('[data-slot="combobox-list"]')).toBeInTheDocument()
	})

	it('accepts custom className', () => {
		const { container } = render(
			<Combobox open>
				<ComboboxList data-testid='list' className='custom-list' />
			</Combobox>,
		)
		const list = container.querySelector('[data-slot="combobox-list"]')
		expect(list).toHaveClass('custom-list')
	})
})

describe('ComboboxItem', () => {
	it('renders with data-slot attribute', () => {
		const { container } = render(
			<Combobox open>
				<ComboboxList>
					<ComboboxItem data-testid='item'>Option</ComboboxItem>
				</ComboboxList>
			</Combobox>,
		)
		expect(container.querySelector('[data-slot="combobox-item"]')).toBeInTheDocument()
	})

	it('renders children', () => {
		render(
			<Combobox open>
				<ComboboxList>
					<ComboboxItem>Option Text</ComboboxItem>
				</ComboboxList>
			</Combobox>,
		)
		expect(screen.getByText('Option Text')).toBeInTheDocument()
	})

	it('renders item indicator', () => {
		const { container } = render(
			<Combobox open>
				<ComboboxList>
					<ComboboxItem data-testid='item'>Option</ComboboxItem>
				</ComboboxList>
			</Combobox>,
		)
		const item = container.querySelector('[data-slot="combobox-item"]')
		const indicator = item?.querySelector('svg')
		expect(indicator).toBeInTheDocument()
	})

	it('accepts custom className', () => {
		const { container } = render(
			<Combobox open>
				<ComboboxList>
					<ComboboxItem data-testid='item' className='custom-item'>
						Option
					</ComboboxItem>
				</ComboboxList>
			</Combobox>,
		)
		const item = container.querySelector('[data-slot="combobox-item"]')
		expect(item).toHaveClass('custom-item')
	})
})

describe('ComboboxGroup', () => {
	it('renders with data-slot attribute', () => {
		const { container } = render(
			<Combobox open>
				<ComboboxList>
					<ComboboxGroup data-testid='group' />
				</ComboboxList>
			</Combobox>,
		)
		expect(container.querySelector('[data-slot="combobox-group"]')).toBeInTheDocument()
	})

	it('renders group with label and items', () => {
		render(
			<Combobox open>
				<ComboboxList>
					<ComboboxGroup>
						<ComboboxLabel>Group Label</ComboboxLabel>
						<ComboboxItem>Item 1</ComboboxItem>
					</ComboboxGroup>
				</ComboboxList>
			</Combobox>,
		)
		expect(screen.getByText('Group Label')).toBeInTheDocument()
		expect(screen.getByText('Item 1')).toBeInTheDocument()
	})
})

describe('ComboboxLabel', () => {
	it('renders with data-slot attribute', () => {
		const { container } = render(
			<Combobox open>
				<ComboboxList>
					<ComboboxGroup>
						<ComboboxLabel data-testid='label'>Label</ComboboxLabel>
					</ComboboxGroup>
				</ComboboxList>
			</Combobox>,
		)
		expect(container.querySelector('[data-slot="combobox-label"]')).toBeInTheDocument()
	})

	it('renders label text', () => {
		render(
			<Combobox open>
				<ComboboxList>
					<ComboboxGroup>
						<ComboboxLabel>Category</ComboboxLabel>
					</ComboboxGroup>
				</ComboboxList>
			</Combobox>,
		)
		expect(screen.getByText('Category')).toBeInTheDocument()
	})
})

describe('ComboboxCollection', () => {
	it('is exported and can be composed', () => {
		// ComboboxCollection is a component that requires the full Combobox context setup
		// Its presence in exports allows for composition in advanced scenarios
		expect(ComboboxCollection).toBeDefined()
	})
})

describe('ComboboxEmpty', () => {
	it('renders with data-slot attribute', () => {
		render(
			<Combobox defaultOpen>
				<ComboboxInput />
				<ComboboxContent>
					<ComboboxList>
						<ComboboxEmpty data-testid='empty' />
					</ComboboxList>
				</ComboboxContent>
			</Combobox>,
		)
		const content = document.querySelector('[data-slot="combobox-empty"]')
		expect(content).toHaveAttribute('data-slot', 'combobox-empty')
	})

	it('accepts custom className', () => {
		render(
			<Combobox defaultOpen>
				<ComboboxInput />
				<ComboboxContent>
					<ComboboxList>
						<ComboboxEmpty data-testid='empty' className='custom-empty' />
					</ComboboxList>
				</ComboboxContent>
			</Combobox>,
		)
		const empty = document.querySelector('[data-slot="combobox-empty"]')
		expect(empty).toHaveClass('custom-empty')
	})
})

describe('ComboboxSeparator', () => {
	it('renders with data-slot attribute', () => {
		const { container } = render(
			<Combobox open>
				<ComboboxList>
					<ComboboxSeparator data-testid='separator' />
				</ComboboxList>
			</Combobox>,
		)
		expect(container.querySelector('[data-slot="combobox-separator"]')).toBeInTheDocument()
	})

	it('accepts custom className', () => {
		const { container } = render(
			<Combobox open>
				<ComboboxList>
					<ComboboxSeparator data-testid='separator' className='custom-separator' />
				</ComboboxList>
			</Combobox>,
		)
		const separator = container.querySelector('[data-slot="combobox-separator"]')
		expect(separator).toHaveClass('custom-separator')
	})
})

describe('ComboboxChips', () => {
	it('renders with data-slot attribute within combobox', () => {
		const { container } = render(
			<Combobox>
				<ComboboxChips data-testid='chips' />
			</Combobox>,
		)
		const chips = container.querySelector('[data-slot="combobox-chips"]')
		expect(chips).toHaveAttribute('data-slot', 'combobox-chips')
	})

	it('renders with flex layout', () => {
		const { container } = render(
			<Combobox>
				<ComboboxChips data-testid='chips' />
			</Combobox>,
		)
		const chips = container.querySelector('[data-slot="combobox-chips"]')
		expect(chips).toHaveClass('flex')
	})

	it('accepts custom className', () => {
		const { container } = render(
			<Combobox>
				<ComboboxChips data-testid='chips' className='custom-chips' />
			</Combobox>,
		)
		const chips = container.querySelector('[data-slot="combobox-chips"]')
		expect(chips).toHaveClass('custom-chips')
	})
})

describe('ComboboxChip', () => {
	it('renders with data-slot attribute within combobox chips', () => {
		const { container } = render(
			<Combobox>
				<ComboboxChips>
					<ComboboxChip data-testid='chip'>Tag</ComboboxChip>
				</ComboboxChips>
			</Combobox>,
		)
		const chip = container.querySelector('[data-slot="combobox-chip"]')
		expect(chip).toHaveAttribute('data-slot', 'combobox-chip')
	})

	it('renders chip text', () => {
		render(
			<Combobox>
				<ComboboxChips>
					<ComboboxChip>Chip Label</ComboboxChip>
				</ComboboxChips>
			</Combobox>,
		)
		expect(screen.getByText('Chip Label')).toBeInTheDocument()
	})

	it('renders remove button by default', () => {
		const { container } = render(
			<Combobox>
				<ComboboxChips>
					<ComboboxChip data-testid='chip'>Chip</ComboboxChip>
				</ComboboxChips>
			</Combobox>,
		)
		const removeButton = container.querySelector('[data-slot="combobox-chip-remove"]')
		expect(removeButton).toBeInTheDocument()
	})

	it('hides remove button when showRemove is false', () => {
		const { container } = render(
			<Combobox>
				<ComboboxChips>
					<ComboboxChip data-testid='chip' showRemove={false}>
						Chip
					</ComboboxChip>
				</ComboboxChips>
			</Combobox>,
		)
		const removeButton = container.querySelector('[data-slot="combobox-chip-remove"]')
		expect(removeButton).not.toBeInTheDocument()
	})

	it('accepts custom className', () => {
		const { container } = render(
			<Combobox>
				<ComboboxChips>
					<ComboboxChip data-testid='chip' className='custom-chip'>
						Chip
					</ComboboxChip>
				</ComboboxChips>
			</Combobox>,
		)
		const chip = container.querySelector('[data-slot="combobox-chip"]')
		expect(chip).toHaveClass('custom-chip')
	})
})

describe('ComboboxChipsInput', () => {
	it('renders with data-slot attribute', () => {
		const { container } = render(
			<Combobox>
				<ComboboxChipsInput data-testid='chip-input' />
			</Combobox>,
		)
		expect(container.querySelector('[data-slot="combobox-chip-input"]')).toBeInTheDocument()
	})

	it('accepts custom className', () => {
		const { container } = render(
			<Combobox>
				<ComboboxChipsInput data-testid='chip-input' className='custom-input' />
			</Combobox>,
		)
		const input = container.querySelector('[data-slot="combobox-chip-input"]')
		expect(input).toHaveClass('custom-input')
	})
})
