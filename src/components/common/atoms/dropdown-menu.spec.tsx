import { render, screen } from '@testing-library/react'

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
	DropdownMenuItem,
	DropdownMenuCheckboxItem,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuSub,
	DropdownMenuSubTrigger,
	DropdownMenuSubContent,
	DropdownMenuGroup,
	DropdownMenuPortal,
} from './dropdown-menu'

function openDropdown(children: React.ReactNode) {
	return render(<DropdownMenu open>{children}</DropdownMenu>)
}

function querySlot(slot: string) {
	return document.querySelector(`[data-slot="${slot}"]`)
}

describe('DropdownMenu', () => {
	it('renders trigger with data-slot', () => {
		openDropdown(<DropdownMenuTrigger>Open</DropdownMenuTrigger>)
		expect(querySlot('dropdown-menu-trigger')).toBeInTheDocument()
	})

	it('passes through props to trigger', () => {
		openDropdown(<DropdownMenuTrigger>Open</DropdownMenuTrigger>)
		const trigger = screen.getByRole('button')
		expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
		expect(trigger).toHaveAttribute('data-state', 'open')
	})
})

describe('DropdownMenuContent', () => {
	it('renders with data-slot when forceMount', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuItem>Item</DropdownMenuItem>
				</DropdownMenuContent>
			</>,
		)
		expect(querySlot('dropdown-menu-content')).toBeInTheDocument()
	})

	it('renders children items', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuItem>First</DropdownMenuItem>
					<DropdownMenuItem>Second</DropdownMenuItem>
				</DropdownMenuContent>
			</>,
		)
		expect(screen.getByText('First')).toBeInTheDocument()
		expect(screen.getByText('Second')).toBeInTheDocument()
	})

	it('merges custom className', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount className='custom-content'>
					<DropdownMenuItem>Item</DropdownMenuItem>
				</DropdownMenuContent>
			</>,
		)
		expect(querySlot('dropdown-menu-content')).toHaveClass('custom-content')
	})
})

describe('DropdownMenuItem', () => {
	it('renders with data-slot', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuItem>Item</DropdownMenuItem>
				</DropdownMenuContent>
			</>,
		)
		expect(querySlot('dropdown-menu-item')).toBeInTheDocument()
	})

	it('has menuitem role', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuItem>Item</DropdownMenuItem>
				</DropdownMenuContent>
			</>,
		)
		expect(screen.getByRole('menuitem')).toHaveTextContent('Item')
	})

	it('renders with default variant', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuItem>Item</DropdownMenuItem>
				</DropdownMenuContent>
			</>,
		)
		expect(screen.getByRole('menuitem')).toHaveAttribute('data-variant', 'default')
	})

	it('renders with destructive variant', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuItem variant='destructive'>Delete</DropdownMenuItem>
				</DropdownMenuContent>
			</>,
		)
		expect(screen.getByRole('menuitem')).toHaveAttribute('data-variant', 'destructive')
	})

	it('sets data-inset when inset prop is true', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuItem inset>Inset Item</DropdownMenuItem>
				</DropdownMenuContent>
			</>,
		)
		expect(screen.getByRole('menuitem')).toHaveAttribute('data-inset', 'true')
	})

	it('merges custom className', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuItem className='custom-item'>Item</DropdownMenuItem>
				</DropdownMenuContent>
			</>,
		)
		expect(screen.getByRole('menuitem')).toHaveClass('custom-item')
	})
})

describe('DropdownMenuCheckboxItem', () => {
	it('renders with data-slot', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuCheckboxItem checked>Checkbox</DropdownMenuCheckboxItem>
				</DropdownMenuContent>
			</>,
		)
		expect(querySlot('dropdown-menu-checkbox-item')).toBeInTheDocument()
	})

	it('renders checked state', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuCheckboxItem checked>Checked</DropdownMenuCheckboxItem>
				</DropdownMenuContent>
			</>,
		)
		expect(screen.getByRole('menuitemcheckbox')).toHaveAttribute('aria-checked', 'true')
	})

	it('renders unchecked state', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuCheckboxItem checked={false}>Unchecked</DropdownMenuCheckboxItem>
				</DropdownMenuContent>
			</>,
		)
		expect(screen.getByRole('menuitemcheckbox')).toHaveAttribute('aria-checked', 'false')
	})

	it('sets data-inset when inset prop is true', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuCheckboxItem inset checked>
						Inset
					</DropdownMenuCheckboxItem>
				</DropdownMenuContent>
			</>,
		)
		expect(screen.getByRole('menuitemcheckbox')).toHaveAttribute('data-inset', 'true')
	})

	it('renders children', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuCheckboxItem>Option A</DropdownMenuCheckboxItem>
				</DropdownMenuContent>
			</>,
		)
		expect(screen.getByRole('menuitemcheckbox')).toHaveTextContent('Option A')
	})
})

describe('DropdownMenuRadioGroup', () => {
	it('renders with data-slot', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuRadioGroup>
						<DropdownMenuRadioItem value='a'>A</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</>,
		)
		expect(querySlot('dropdown-menu-radio-group')).toBeInTheDocument()
	})
})

describe('DropdownMenuRadioItem', () => {
	it('renders with data-slot', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuRadioGroup>
						<DropdownMenuRadioItem value='a'>Option A</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</>,
		)
		expect(querySlot('dropdown-menu-radio-item')).toBeInTheDocument()
	})

	it('has menuitemradio role', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuRadioGroup>
						<DropdownMenuRadioItem value='a'>Option A</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</>,
		)
		expect(screen.getByRole('menuitemradio')).toHaveTextContent('Option A')
	})

	it('sets data-inset when inset prop is true', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuRadioGroup>
						<DropdownMenuRadioItem value='a' inset>
							Inset
						</DropdownMenuRadioItem>
					</DropdownMenuRadioGroup>
				</DropdownMenuContent>
			</>,
		)
		expect(screen.getByRole('menuitemradio')).toHaveAttribute('data-inset', 'true')
	})
})

describe('DropdownMenuLabel', () => {
	it('renders with data-slot', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuLabel>Label</DropdownMenuLabel>
				</DropdownMenuContent>
			</>,
		)
		expect(querySlot('dropdown-menu-label')).toBeInTheDocument()
	})

	it('renders text content', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuLabel>Label</DropdownMenuLabel>
				</DropdownMenuContent>
			</>,
		)
		expect(screen.getByText('Label')).toBeInTheDocument()
	})

	it('sets data-inset when inset prop is true', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuLabel inset>Inset Label</DropdownMenuLabel>
				</DropdownMenuContent>
			</>,
		)
		expect(querySlot('dropdown-menu-label')).toHaveAttribute('data-inset', 'true')
	})

	it('merges custom className', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuLabel className='custom-label'>Label</DropdownMenuLabel>
				</DropdownMenuContent>
			</>,
		)
		expect(querySlot('dropdown-menu-label')).toHaveClass('custom-label')
	})
})

describe('DropdownMenuSeparator', () => {
	it('renders with data-slot', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuSeparator />
				</DropdownMenuContent>
			</>,
		)
		expect(querySlot('dropdown-menu-separator')).toBeInTheDocument()
	})

	it('has role separator', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuSeparator />
				</DropdownMenuContent>
			</>,
		)
		expect(querySlot('dropdown-menu-separator')).toHaveAttribute('role', 'separator')
	})

	it('merges custom className', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuSeparator className='custom-sep' />
				</DropdownMenuContent>
			</>,
		)
		expect(querySlot('dropdown-menu-separator')).toHaveClass('custom-sep')
	})
})

describe('DropdownMenuShortcut', () => {
	it('renders with data-slot', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuItem>
						Copy <DropdownMenuShortcut>Ctrl+C</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</>,
		)
		expect(querySlot('dropdown-menu-shortcut')).toBeInTheDocument()
	})

	it('renders text content', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuItem>
						Cut <DropdownMenuShortcut>Ctrl+X</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</>,
		)
		expect(screen.getByText('Ctrl+X')).toBeInTheDocument()
	})

	it('merges custom className', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuItem>
						Paste <DropdownMenuShortcut className='custom-shortcut'>Ctrl+V</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</>,
		)
		expect(querySlot('dropdown-menu-shortcut')).toHaveClass('custom-shortcut')
	})
})

describe('DropdownMenuGroup', () => {
	it('renders with data-slot', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuGroup>
						<DropdownMenuItem>Item</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</>,
		)
		expect(querySlot('dropdown-menu-group')).toBeInTheDocument()
	})

	it('renders children', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuGroup>
						<DropdownMenuItem>Grouped Item</DropdownMenuItem>
					</DropdownMenuGroup>
				</DropdownMenuContent>
			</>,
		)
		expect(screen.getByText('Grouped Item')).toBeInTheDocument()
	})
})

describe('DropdownMenuPortal', () => {
	it('renders content through portal', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuPortal>
					<DropdownMenuContent forceMount>
						<DropdownMenuItem>Item</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenuPortal>
			</>,
		)
		expect(screen.getByText('Item')).toBeInTheDocument()
	})
})

describe('DropdownMenuSub', () => {
	it('renders sub trigger and content', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuSub open>
						<DropdownMenuSubTrigger>Submenu</DropdownMenuSubTrigger>
						<DropdownMenuSubContent forceMount>
							<DropdownMenuItem>Sub Item</DropdownMenuItem>
						</DropdownMenuSubContent>
					</DropdownMenuSub>
				</DropdownMenuContent>
			</>,
		)
		expect(screen.getByText('Submenu')).toBeInTheDocument()
		expect(screen.getByText('Sub Item')).toBeInTheDocument()
	})
})

describe('DropdownMenuSubTrigger', () => {
	it('renders with data-slot', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuSub open>
						<DropdownMenuSubTrigger>Submenu</DropdownMenuSubTrigger>
					</DropdownMenuSub>
				</DropdownMenuContent>
			</>,
		)
		expect(querySlot('dropdown-menu-sub-trigger')).toBeInTheDocument()
	})

	it('renders with chevron icon', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuSub open>
						<DropdownMenuSubTrigger>More</DropdownMenuSubTrigger>
					</DropdownMenuSub>
				</DropdownMenuContent>
			</>,
		)
		const trigger = querySlot('dropdown-menu-sub-trigger')
		expect(trigger?.querySelector('svg')).toBeInTheDocument()
	})

	it('sets data-inset when inset prop is true', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuSub open>
						<DropdownMenuSubTrigger inset>Inset Sub</DropdownMenuSubTrigger>
					</DropdownMenuSub>
				</DropdownMenuContent>
			</>,
		)
		expect(querySlot('dropdown-menu-sub-trigger')).toHaveAttribute('data-inset', 'true')
	})

	it('merges custom className', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuSub open>
						<DropdownMenuSubTrigger className='custom-sub-trigger'>Sub</DropdownMenuSubTrigger>
					</DropdownMenuSub>
				</DropdownMenuContent>
			</>,
		)
		expect(querySlot('dropdown-menu-sub-trigger')).toHaveClass('custom-sub-trigger')
	})
})

describe('DropdownMenuSubContent', () => {
	it('renders with data-slot', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuSub open>
						<DropdownMenuSubTrigger>Submenu</DropdownMenuSubTrigger>
						<DropdownMenuSubContent forceMount>
							<DropdownMenuItem>Sub Item</DropdownMenuItem>
						</DropdownMenuSubContent>
					</DropdownMenuSub>
				</DropdownMenuContent>
			</>,
		)
		expect(querySlot('dropdown-menu-sub-content')).toBeInTheDocument()
	})

	it('merges custom className', () => {
		openDropdown(
			<>
				<DropdownMenuTrigger>Open</DropdownMenuTrigger>
				<DropdownMenuContent forceMount>
					<DropdownMenuSub open>
						<DropdownMenuSubTrigger>Submenu</DropdownMenuSubTrigger>
						<DropdownMenuSubContent forceMount className='custom-sub-content'>
							<DropdownMenuItem>Sub Item</DropdownMenuItem>
						</DropdownMenuSubContent>
					</DropdownMenuSub>
				</DropdownMenuContent>
			</>,
		)
		expect(querySlot('dropdown-menu-sub-content')).toHaveClass('custom-sub-content')
	})
})
