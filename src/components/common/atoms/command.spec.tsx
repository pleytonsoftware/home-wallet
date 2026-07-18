import { render, screen } from '@testing-library/react'

import {
	Command,
	CommandDialog,
	CommandInput,
	CommandList,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandShortcut,
	CommandSeparator,
} from './command'

beforeAll(() => {
	globalThis.ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
})

describe('Command', () => {
	it('renders with data-slot', () => {
		render(<Command data-testid='command' />)
		expect(screen.getByTestId('command')).toHaveAttribute('data-slot', 'command')
	})

	it('applies default classes', () => {
		render(<Command data-testid='command' />)
		const el = screen.getByTestId('command')
		expect(el).toHaveClass('flex', 'rounded-xl!', 'bg-popover', 'p-1')
	})

	it('merges custom className', () => {
		render(<Command data-testid='command' className='custom-cmd' />)
		expect(screen.getByTestId('command')).toHaveClass('custom-cmd')
	})

	it('renders children', () => {
		render(
			<Command data-testid='command'>
				<div>child</div>
			</Command>,
		)
		expect(screen.getByText('child')).toBeInTheDocument()
	})
})

describe('CommandInput', () => {
	it('renders input with data-slot', () => {
		render(
			<Command>
				<CommandInput data-testid='input' />
			</Command>,
		)
		expect(screen.getByTestId('input')).toHaveAttribute('data-slot', 'command-input')
	})

	it('renders input wrapper with data-slot', () => {
		render(
			<Command>
				<CommandInput data-testid='input' />
			</Command>,
		)
		const wrapper = screen.getByTestId('input').closest('[data-slot="command-input-wrapper"]')
		expect(wrapper).toBeInTheDocument()
	})

	it('renders as textbox', () => {
		render(
			<Command>
				<CommandInput data-testid='input' />
			</Command>,
		)
		expect(screen.getByTestId('input')).toHaveAttribute('role', 'combobox')
	})

	it('merges custom className', () => {
		render(
			<Command>
				<CommandInput data-testid='input' className='custom-input' />
			</Command>,
		)
		expect(screen.getByTestId('input')).toHaveClass('custom-input')
	})

	it('renders search icon', () => {
		const { container } = render(
			<Command>
				<CommandInput />
			</Command>,
		)
		const svg = container.querySelector('svg')
		expect(svg).toBeInTheDocument()
	})
})

describe('CommandList', () => {
	it('renders with data-slot', () => {
		render(
			<Command>
				<CommandList data-testid='list' />
			</Command>,
		)
		expect(screen.getByTestId('list')).toHaveAttribute('data-slot', 'command-list')
	})

	it('applies default classes', () => {
		render(
			<Command>
				<CommandList data-testid='list' />
			</Command>,
		)
		expect(screen.getByTestId('list')).toHaveClass('max-h-72', 'overflow-y-auto')
	})

	it('merges custom className', () => {
		render(
			<Command>
				<CommandList data-testid='list' className='custom-list' />
			</Command>,
		)
		expect(screen.getByTestId('list')).toHaveClass('custom-list')
	})
})

describe('CommandEmpty', () => {
	it('renders with data-slot', () => {
		render(
			<Command>
				<CommandEmpty data-testid='empty' />
			</Command>,
		)
		expect(screen.getByTestId('empty')).toHaveAttribute('data-slot', 'command-empty')
	})

	it('applies default classes', () => {
		render(
			<Command>
				<CommandEmpty data-testid='empty' />
			</Command>,
		)
		expect(screen.getByTestId('empty')).toHaveClass('py-6', 'text-center', 'text-sm')
	})

	it('merges custom className', () => {
		render(
			<Command>
				<CommandEmpty data-testid='empty' className='custom-empty' />
			</Command>,
		)
		expect(screen.getByTestId('empty')).toHaveClass('custom-empty')
	})

	it('renders children', () => {
		render(
			<Command>
				<CommandEmpty data-testid='empty'>No results</CommandEmpty>
			</Command>,
		)
		expect(screen.getByText('No results')).toBeInTheDocument()
	})
})

describe('CommandGroup', () => {
	it('renders with data-slot', () => {
		render(
			<Command>
				<CommandGroup data-testid='group' />
			</Command>,
		)
		expect(screen.getByTestId('group')).toHaveAttribute('data-slot', 'command-group')
	})

	it('applies default classes', () => {
		render(
			<Command>
				<CommandGroup data-testid='group' />
			</Command>,
		)
		expect(screen.getByTestId('group')).toHaveClass('overflow-hidden', 'p-1')
	})

	it('merges custom className', () => {
		render(
			<Command>
				<CommandGroup data-testid='group' className='custom-group' />
			</Command>,
		)
		expect(screen.getByTestId('group')).toHaveClass('custom-group')
	})

	it('renders children', () => {
		render(
			<Command>
				<CommandGroup data-testid='group'>
					<div>group content</div>
				</CommandGroup>
			</Command>,
		)
		expect(screen.getByText('group content')).toBeInTheDocument()
	})
})

describe('CommandSeparator', () => {
	it('renders with data-slot', () => {
		render(
			<Command>
				<CommandSeparator data-testid='separator' />
			</Command>,
		)
		expect(screen.getByTestId('separator')).toHaveAttribute('data-slot', 'command-separator')
	})

	it('applies default classes', () => {
		render(
			<Command>
				<CommandSeparator data-testid='separator' />
			</Command>,
		)
		expect(screen.getByTestId('separator')).toHaveClass('-mx-1', 'h-px', 'bg-border')
	})

	it('merges custom className', () => {
		render(
			<Command>
				<CommandSeparator data-testid='separator' className='custom-sep' />
			</Command>,
		)
		expect(screen.getByTestId('separator')).toHaveClass('custom-sep')
	})
})

describe('CommandItem', () => {
	it('renders with data-slot', () => {
		render(
			<Command>
				<CommandItem data-testid='item'>Item</CommandItem>
			</Command>,
		)
		expect(screen.getByTestId('item')).toHaveAttribute('data-slot', 'command-item')
	})

	it('applies default classes', () => {
		render(
			<Command>
				<CommandItem data-testid='item'>Item</CommandItem>
			</Command>,
		)
		expect(screen.getByTestId('item')).toHaveClass('flex', 'items-center', 'gap-2', 'rounded-sm', 'px-2', 'py-1.5', 'text-sm')
	})

	it('merges custom className', () => {
		render(
			<Command>
				<CommandItem data-testid='item' className='custom-item'>
					Item
				</CommandItem>
			</Command>,
		)
		expect(screen.getByTestId('item')).toHaveClass('custom-item')
	})

	it('renders children', () => {
		render(
			<Command>
				<CommandItem data-testid='item'>Dashboard</CommandItem>
			</Command>,
		)
		expect(screen.getByText('Dashboard')).toBeInTheDocument()
	})

	it('renders check icon (hidden by default)', () => {
		const { container } = render(
			<Command>
				<CommandItem data-testid='item'>Item</CommandItem>
			</Command>,
		)
		const item = screen.getByTestId('item')
		const svg = item.querySelector('svg')
		expect(svg).toBeInTheDocument()
	})

	it('renders with shortcut', () => {
		render(
			<Command>
				<CommandItem data-testid='item'>
					Action <CommandShortcut>Ctrl+K</CommandShortcut>
				</CommandItem>
			</Command>,
		)
		expect(screen.getByText('Action')).toBeInTheDocument()
		expect(screen.getByText('Ctrl+K')).toBeInTheDocument()
	})
})

describe('CommandShortcut', () => {
	it('renders with data-slot', () => {
		render(
			<Command>
				<CommandItem>
					Item <CommandShortcut data-testid='shortcut'>⌘K</CommandShortcut>
				</CommandItem>
			</Command>,
		)
		expect(screen.getByTestId('shortcut')).toHaveAttribute('data-slot', 'command-shortcut')
	})

	it('applies default classes', () => {
		render(
			<Command>
				<CommandItem>
					Item <CommandShortcut data-testid='shortcut'>⌘K</CommandShortcut>
				</CommandItem>
			</Command>,
		)
		expect(screen.getByTestId('shortcut')).toHaveClass('ml-auto', 'text-xs', 'tracking-widest')
	})

	it('merges custom className', () => {
		render(
			<Command>
				<CommandItem>
					Item{' '}
					<CommandShortcut data-testid='shortcut' className='custom-sc'>
						⌘K
					</CommandShortcut>
				</CommandItem>
			</Command>,
		)
		expect(screen.getByTestId('shortcut')).toHaveClass('custom-sc')
	})

	it('renders shortcut text', () => {
		render(
			<Command>
				<CommandItem>
					Test <CommandShortcut>Cmd+Shift+K</CommandShortcut>
				</CommandItem>
			</Command>,
		)
		expect(screen.getByText('Cmd+Shift+K')).toBeInTheDocument()
	})
})
