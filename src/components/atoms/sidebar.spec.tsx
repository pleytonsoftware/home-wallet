import { useIsMobile } from '@/hooks/use-mobile'

import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import {
	SidebarProvider,
	Sidebar,
	SidebarTrigger,
	SidebarRail,
	SidebarInset,
	SidebarInput,
	SidebarHeader,
	SidebarFooter,
	SidebarContent,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupAction,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarMenuAction,
	SidebarMenuBadge,
	SidebarMenuSkeleton,
	SidebarMenuSub,
	SidebarMenuSubItem,
	SidebarMenuSubButton,
	SidebarSeparator,
	useSidebar,
} from './sidebar'

vi.mock('@/hooks/use-mobile', () => ({
	useIsMobile: vi.fn(() => false),
}))

vi.mock('@atoms/tooltip', () => ({
	Tooltip: ({ children }: { children: React.ReactNode }) => <div data-testid='tooltip'>{children}</div>,
	TooltipTrigger: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
	TooltipContent: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
	TooltipProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('@atoms/sheet', () => ({
	Sheet: ({ children, ...props }: React.ComponentProps<'div'>) => (
		<div data-testid='sheet' {...props}>
			{children}
		</div>
	),
	SheetContent: ({ children, ...props }: React.ComponentProps<'div'>) => (
		<div data-testid='sheet-content' {...props}>
			{children}
		</div>
	),
	SheetHeader: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
	SheetTitle: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
	SheetDescription: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
}))

vi.mock('lucide-react', () => ({
	PanelLeftIcon: () => <svg data-testid='panel-left-icon' />,
}))

function TestConsumer() {
	const { state, open, setOpen, isMobile, toggleSidebar } = useSidebar()
	return (
		<div>
			<span data-testid='state'>{state}</span>
			<span data-testid='open'>{String(open)}</span>
			<span data-testid='is-mobile'>{String(isMobile)}</span>
			<button data-testid='toggle' onClick={toggleSidebar} />
			<button data-testid='set-closed' onClick={() => setOpen(false)} />
			<button data-testid='set-open' onClick={() => setOpen(true)} />
		</div>
	)
}

describe('SidebarProvider', () => {
	beforeEach(() => {
		vi.mocked(useIsMobile).mockReturnValue(false)
		document.cookie = 'sidebar_state=; path=/; max-age=0'
	})

	it('renders children', () => {
		render(
			<SidebarProvider>
				<div data-testid='child'>Content</div>
			</SidebarProvider>,
		)
		expect(screen.getByTestId('child')).toBeInTheDocument()
	})

	it('renders wrapper with data-slot', () => {
		const { container } = render(
			<SidebarProvider>
				<div>Content</div>
			</SidebarProvider>,
		)
		const wrapper = container.querySelector('[data-slot="sidebar-wrapper"]')
		expect(wrapper).toBeInTheDocument()
	})

	it('defaults to open state', () => {
		render(
			<SidebarProvider>
				<TestConsumer />
			</SidebarProvider>,
		)
		expect(screen.getByTestId('open')).toHaveTextContent('true')
		expect(screen.getByTestId('state')).toHaveTextContent('expanded')
	})

	it('supports defaultOpen=false', () => {
		render(
			<SidebarProvider defaultOpen={false}>
				<TestConsumer />
			</SidebarProvider>,
		)
		expect(screen.getByTestId('open')).toHaveTextContent('false')
		expect(screen.getByTestId('state')).toHaveTextContent('collapsed')
	})

	it('toggles open state via context', async () => {
		const user = userEvent.setup()
		render(
			<SidebarProvider>
				<TestConsumer />
			</SidebarProvider>,
		)

		expect(screen.getByTestId('open')).toHaveTextContent('true')

		await user.click(screen.getByTestId('toggle'))
		expect(screen.getByTestId('open')).toHaveTextContent('false')
		expect(screen.getByTestId('state')).toHaveTextContent('collapsed')

		await user.click(screen.getByTestId('toggle'))
		expect(screen.getByTestId('open')).toHaveTextContent('true')
		expect(screen.getByTestId('state')).toHaveTextContent('expanded')
	})

	it('sets cookie when toggling', async () => {
		const user = userEvent.setup()
		render(
			<SidebarProvider>
				<TestConsumer />
			</SidebarProvider>,
		)

		await user.click(screen.getByTestId('toggle'))
		expect(document.cookie).toContain('sidebar_state=false')

		await user.click(screen.getByTestId('toggle'))
		expect(document.cookie).toContain('sidebar_state=true')
	})

	it('supports keyboard shortcut Ctrl+B', async () => {
		render(
			<SidebarProvider>
				<TestConsumer />
			</SidebarProvider>,
		)

		expect(screen.getByTestId('open')).toHaveTextContent('true')

		fireEvent.keyDown(window, { key: 'b', ctrlKey: true })
		expect(screen.getByTestId('open')).toHaveTextContent('false')

		fireEvent.keyDown(window, { key: 'b', ctrlKey: true })
		expect(screen.getByTestId('open')).toHaveTextContent('true')
	})

	it('supports keyboard shortcut Cmd+B', async () => {
		render(
			<SidebarProvider>
				<TestConsumer />
			</SidebarProvider>,
		)

		fireEvent.keyDown(window, { key: 'b', metaKey: true })
		expect(screen.getByTestId('open')).toHaveTextContent('false')
	})

	it('supports controlled open prop', async () => {
		const user = userEvent.setup()
		const onOpenChange = vi.fn()

		render(
			<SidebarProvider open={true} onOpenChange={onOpenChange}>
				<TestConsumer />
			</SidebarProvider>,
		)

		expect(screen.getByTestId('open')).toHaveTextContent('true')

		await user.click(screen.getByTestId('toggle'))
		expect(onOpenChange).toHaveBeenCalledWith(false)
	})

	it('accepts custom className', () => {
		const { container } = render(
			<SidebarProvider className='custom-class'>
				<div>Content</div>
			</SidebarProvider>,
		)
		const wrapper = container.querySelector('[data-slot="sidebar-wrapper"]')
		expect(wrapper).toHaveClass('custom-class')
	})

	it('accepts custom style', () => {
		const { container } = render(
			<SidebarProvider style={{ opacity: '0.5' }}>
				<div>Content</div>
			</SidebarProvider>,
		)
		const wrapper = container.querySelector('[data-slot="sidebar-wrapper"]')
		expect(wrapper).toHaveAttribute('style')
		expect(wrapper?.getAttribute('style')).toContain('opacity: 0.5')
	})
})

describe('useSidebar', () => {
	it('throws when used outside SidebarProvider', () => {
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
		expect(() => render(<TestConsumer />)).toThrow('useSidebar must be used within a SidebarProvider.')
		consoleSpy.mockRestore()
	})
})

describe('Sidebar', () => {
	beforeEach(() => {
		vi.mocked(useIsMobile).mockReturnValue(false)
	})

	it('renders desktop sidebar with data-slot', () => {
		render(
			<SidebarProvider>
				<Sidebar>
					<div data-testid='content'>Content</div>
				</Sidebar>
			</SidebarProvider>,
		)
		const sidebar = screen.getByTestId('content').closest('[data-slot="sidebar"]')
		expect(sidebar).toBeInTheDocument()
	})

	it('renders with default props (left, sidebar, offcanvas)', () => {
		render(
			<SidebarProvider>
				<Sidebar>
					<div>Content</div>
				</Sidebar>
			</SidebarProvider>,
		)
		const sidebar = document.querySelector('[data-slot="sidebar"]')
		expect(sidebar).toHaveAttribute('data-side', 'left')
		expect(sidebar).toHaveAttribute('data-variant', 'sidebar')
		expect(sidebar).toHaveAttribute('data-state', 'expanded')
	})

	it('renders with right side', () => {
		render(
			<SidebarProvider>
				<Sidebar side='right'>
					<div>Content</div>
				</Sidebar>
			</SidebarProvider>,
		)
		const sidebar = document.querySelector('[data-slot="sidebar"]')
		expect(sidebar).toHaveAttribute('data-side', 'right')
	})

	it('renders collapsed state', () => {
		render(
			<SidebarProvider defaultOpen={false}>
				<Sidebar>
					<div>Content</div>
				</Sidebar>
			</SidebarProvider>,
		)
		const sidebar = document.querySelector('[data-slot="sidebar"]')
		expect(sidebar).toHaveAttribute('data-state', 'collapsed')
		expect(sidebar).toHaveAttribute('data-collapsible', 'offcanvas')
	})

	it('renders floating variant', () => {
		render(
			<SidebarProvider>
				<Sidebar variant='floating'>
					<div>Content</div>
				</Sidebar>
			</SidebarProvider>,
		)
		const sidebar = document.querySelector('[data-slot="sidebar"]')
		expect(sidebar).toHaveAttribute('data-variant', 'floating')
	})

	it('renders inset variant', () => {
		render(
			<SidebarProvider>
				<Sidebar variant='inset'>
					<div>Content</div>
				</Sidebar>
			</SidebarProvider>,
		)
		const sidebar = document.querySelector('[data-slot="sidebar"]')
		expect(sidebar).toHaveAttribute('data-variant', 'inset')
	})

	it('renders collapsible=none without wrapper divs', () => {
		render(
			<SidebarProvider>
				<Sidebar collapsible='none'>
					<div data-testid='content'>Content</div>
				</Sidebar>
			</SidebarProvider>,
		)
		const sidebar = screen.getByTestId('content').closest('[data-slot="sidebar"]')
		expect(sidebar).toBeInTheDocument()
		expect(sidebar).not.toHaveAttribute('data-state')
	})

	it('renders mobile sidebar via Sheet', () => {
		vi.mocked(useIsMobile).mockReturnValue(true)
		render(
			<SidebarProvider>
				<Sidebar>
					<div data-testid='content'>Content</div>
				</Sidebar>
			</SidebarProvider>,
		)
		expect(screen.getByTestId('sheet')).toBeInTheDocument()
		expect(screen.getByTestId('sheet-content')).toBeInTheDocument()
	})

	it('accepts custom className', () => {
		render(
			<SidebarProvider>
				<Sidebar className='custom-sidebar'>
					<div>Content</div>
				</Sidebar>
			</SidebarProvider>,
		)
		const container = document.querySelector('[data-slot="sidebar-container"]')
		expect(container).toHaveClass('custom-sidebar')
	})
})

describe('SidebarTrigger', () => {
	beforeEach(() => {
		vi.mocked(useIsMobile).mockReturnValue(false)
	})

	it('renders with data-slot', () => {
		render(
			<SidebarProvider>
				<SidebarTrigger />
			</SidebarProvider>,
		)
		const trigger = document.querySelector('[data-slot="sidebar-trigger"]')
		expect(trigger).toBeInTheDocument()
	})

	it('toggles sidebar on click', async () => {
		const user = userEvent.setup()
		render(
			<SidebarProvider>
				<SidebarTrigger data-testid='trigger' />
				<TestConsumer />
			</SidebarProvider>,
		)

		expect(screen.getByTestId('open')).toHaveTextContent('true')
		await user.click(screen.getByTestId('trigger'))
		expect(screen.getByTestId('open')).toHaveTextContent('false')
	})

	it('accepts custom className', () => {
		render(
			<SidebarProvider>
				<SidebarTrigger className='custom-trigger' />
			</SidebarProvider>,
		)
		const trigger = document.querySelector('[data-slot="sidebar-trigger"]')
		expect(trigger).toHaveClass('custom-trigger')
	})

	it('calls custom onClick handler', async () => {
		const user = userEvent.setup()
		const onClick = vi.fn()
		render(
			<SidebarProvider>
				<SidebarTrigger data-testid='trigger' onClick={onClick} />
			</SidebarProvider>,
		)

		await user.click(screen.getByTestId('trigger'))
		expect(onClick).toHaveBeenCalledTimes(1)
	})
})

describe('SidebarRail', () => {
	beforeEach(() => {
		vi.mocked(useIsMobile).mockReturnValue(false)
	})

	it('renders with data-slot', () => {
		render(
			<SidebarProvider>
				<Sidebar>
					<SidebarRail />
				</Sidebar>
			</SidebarProvider>,
		)
		const rail = document.querySelector('[data-slot="sidebar-rail"]')
		expect(rail).toBeInTheDocument()
	})

	it('has correct aria-label', () => {
		render(
			<SidebarProvider>
				<Sidebar>
					<SidebarRail />
				</Sidebar>
			</SidebarProvider>,
		)
		const rail = document.querySelector('[data-slot="sidebar-rail"]')
		expect(rail).toHaveAttribute('aria-label', 'Toggle Sidebar')
	})

	it('toggles sidebar on click', async () => {
		const user = userEvent.setup()
		render(
			<SidebarProvider>
				<Sidebar>
					<SidebarRail data-testid='rail' />
				</Sidebar>
				<TestConsumer />
			</SidebarProvider>,
		)

		expect(screen.getByTestId('open')).toHaveTextContent('true')
		await user.click(screen.getByTestId('rail'))
		expect(screen.getByTestId('open')).toHaveTextContent('false')
	})
})

describe('SidebarInset', () => {
	it('renders main with data-slot', () => {
		render(
			<SidebarProvider>
				<SidebarInset data-testid='inset'>Content</SidebarInset>
			</SidebarProvider>,
		)
		expect(screen.getByTestId('inset').closest('[data-slot="sidebar-inset"]')).toBeInTheDocument()
	})

	it('accepts custom className', () => {
		render(
			<SidebarProvider>
				<SidebarInset className='custom-inset'>Content</SidebarInset>
			</SidebarProvider>,
		)
		const inset = document.querySelector('[data-slot="sidebar-inset"]')
		expect(inset).toHaveClass('custom-inset')
	})
})

describe('SidebarInput', () => {
	it('renders input with data-slot', () => {
		render(
			<SidebarProvider>
				<SidebarInput data-testid='input' />
			</SidebarProvider>,
		)
		const input = screen.getByTestId('input')
		expect(input).toHaveAttribute('data-slot', 'sidebar-input')
	})

	it('accepts custom className', () => {
		render(
			<SidebarProvider>
				<SidebarInput className='custom-input' />
			</SidebarProvider>,
		)
		const input = document.querySelector('[data-slot="sidebar-input"]')
		expect(input).toHaveClass('custom-input')
	})
})

describe('SidebarHeader', () => {
	it('renders with data-slot', () => {
		render(
			<SidebarProvider>
				<SidebarHeader data-testid='header'>Header</SidebarHeader>
			</SidebarProvider>,
		)
		expect(screen.getByTestId('header')).toHaveAttribute('data-slot', 'sidebar-header')
	})

	it('accepts custom className', () => {
		render(
			<SidebarProvider>
				<SidebarHeader className='custom-header'>Header</SidebarHeader>
			</SidebarProvider>,
		)
		const header = document.querySelector('[data-slot="sidebar-header"]')
		expect(header).toHaveClass('custom-header')
	})
})

describe('SidebarFooter', () => {
	it('renders with data-slot', () => {
		render(
			<SidebarProvider>
				<SidebarFooter data-testid='footer'>Footer</SidebarFooter>
			</SidebarProvider>,
		)
		expect(screen.getByTestId('footer')).toHaveAttribute('data-slot', 'sidebar-footer')
	})

	it('accepts custom className', () => {
		render(
			<SidebarProvider>
				<SidebarFooter className='custom-footer'>Footer</SidebarFooter>
			</SidebarProvider>,
		)
		const footer = document.querySelector('[data-slot="sidebar-footer"]')
		expect(footer).toHaveClass('custom-footer')
	})
})

describe('SidebarSeparator', () => {
	it('renders with data-slot', () => {
		render(
			<SidebarProvider>
				<SidebarSeparator data-testid='separator' />
			</SidebarProvider>,
		)
		expect(screen.getByTestId('separator')).toHaveAttribute('data-slot', 'sidebar-separator')
	})

	it('accepts custom className', () => {
		render(
			<SidebarProvider>
				<SidebarSeparator className='custom-separator' />
			</SidebarProvider>,
		)
		const separator = document.querySelector('[data-slot="sidebar-separator"]')
		expect(separator).toHaveClass('custom-separator')
	})
})

describe('SidebarContent', () => {
	it('renders with data-slot', () => {
		render(
			<SidebarProvider>
				<SidebarContent data-testid='content'>Content</SidebarContent>
			</SidebarProvider>,
		)
		expect(screen.getByTestId('content')).toHaveAttribute('data-slot', 'sidebar-content')
	})

	it('accepts custom className', () => {
		render(
			<SidebarProvider>
				<SidebarContent className='custom-content'>Content</SidebarContent>
			</SidebarProvider>,
		)
		const content = document.querySelector('[data-slot="sidebar-content"]')
		expect(content).toHaveClass('custom-content')
	})
})

describe('SidebarGroup', () => {
	it('renders with data-slot', () => {
		render(
			<SidebarProvider>
				<SidebarGroup data-testid='group'>Group</SidebarGroup>
			</SidebarProvider>,
		)
		expect(screen.getByTestId('group')).toHaveAttribute('data-slot', 'sidebar-group')
	})

	it('accepts custom className', () => {
		render(
			<SidebarProvider>
				<SidebarGroup className='custom-group'>Group</SidebarGroup>
			</SidebarProvider>,
		)
		const group = document.querySelector('[data-slot="sidebar-group"]')
		expect(group).toHaveClass('custom-group')
	})
})

describe('SidebarGroupLabel', () => {
	it('renders with data-slot', () => {
		render(
			<SidebarProvider>
				<SidebarGroupLabel data-testid='label'>Label</SidebarGroupLabel>
			</SidebarProvider>,
		)
		expect(screen.getByTestId('label')).toHaveAttribute('data-slot', 'sidebar-group-label')
	})

	it('accepts custom className', () => {
		render(
			<SidebarProvider>
				<SidebarGroupLabel className='custom-label'>Label</SidebarGroupLabel>
			</SidebarProvider>,
		)
		const label = document.querySelector('[data-slot="sidebar-group-label"]')
		expect(label).toHaveClass('custom-label')
	})
})

describe('SidebarGroupAction', () => {
	it('renders with data-slot', () => {
		render(
			<SidebarProvider>
				<SidebarGroupAction data-testid='action'>Action</SidebarGroupAction>
			</SidebarProvider>,
		)
		expect(screen.getByTestId('action')).toHaveAttribute('data-slot', 'sidebar-group-action')
	})

	it('accepts custom className', () => {
		render(
			<SidebarProvider>
				<SidebarGroupAction className='custom-action'>Action</SidebarGroupAction>
			</SidebarProvider>,
		)
		const action = document.querySelector('[data-slot="sidebar-group-action"]')
		expect(action).toHaveClass('custom-action')
	})
})

describe('SidebarGroupContent', () => {
	it('renders with data-slot', () => {
		render(
			<SidebarProvider>
				<SidebarGroupContent data-testid='group-content'>Content</SidebarGroupContent>
			</SidebarProvider>,
		)
		expect(screen.getByTestId('group-content')).toHaveAttribute('data-slot', 'sidebar-group-content')
	})

	it('accepts custom className', () => {
		render(
			<SidebarProvider>
				<SidebarGroupContent className='custom-gc'>Content</SidebarGroupContent>
			</SidebarProvider>,
		)
		const gc = document.querySelector('[data-slot="sidebar-group-content"]')
		expect(gc).toHaveClass('custom-gc')
	})
})

describe('SidebarMenu', () => {
	it('renders with data-slot', () => {
		render(
			<SidebarProvider>
				<SidebarMenu data-testid='menu'>
					<li>Item</li>
				</SidebarMenu>
			</SidebarProvider>,
		)
		expect(screen.getByTestId('menu')).toHaveAttribute('data-slot', 'sidebar-menu')
	})

	it('accepts custom className', () => {
		render(
			<SidebarProvider>
				<SidebarMenu className='custom-menu'>
					<li>Item</li>
				</SidebarMenu>
			</SidebarProvider>,
		)
		const menu = document.querySelector('[data-slot="sidebar-menu"]')
		expect(menu).toHaveClass('custom-menu')
	})
})

describe('SidebarMenuItem', () => {
	it('renders with data-slot', () => {
		render(
			<SidebarProvider>
				<SidebarMenuItem data-testid='menu-item'>Item</SidebarMenuItem>
			</SidebarProvider>,
		)
		expect(screen.getByTestId('menu-item')).toHaveAttribute('data-slot', 'sidebar-menu-item')
	})

	it('accepts custom className', () => {
		render(
			<SidebarProvider>
				<SidebarMenuItem className='custom-item'>Item</SidebarMenuItem>
			</SidebarProvider>,
		)
		const item = document.querySelector('[data-slot="sidebar-menu-item"]')
		expect(item).toHaveClass('custom-item')
	})
})

describe('SidebarMenuButton', () => {
	it('renders with data-slot', () => {
		render(
			<SidebarProvider>
				<SidebarMenuButton data-testid='menu-btn'>Button</SidebarMenuButton>
			</SidebarProvider>,
		)
		expect(screen.getByTestId('menu-btn')).toHaveAttribute('data-slot', 'sidebar-menu-button')
	})

	it('sets data-active when isActive is true', () => {
		render(
			<SidebarProvider>
				<SidebarMenuButton isActive data-testid='menu-btn'>
					Active
				</SidebarMenuButton>
			</SidebarProvider>,
		)
		expect(screen.getByTestId('menu-btn')).toHaveAttribute('data-active', 'true')
	})

	it('sets data-active false when isActive is false', () => {
		render(
			<SidebarProvider>
				<SidebarMenuButton isActive={false} data-testid='menu-btn'>
					Inactive
				</SidebarMenuButton>
			</SidebarProvider>,
		)
		expect(screen.getByTestId('menu-btn')).toHaveAttribute('data-active', 'false')
	})

	it('passes size prop as data-size', () => {
		render(
			<SidebarProvider>
				<SidebarMenuButton size='sm' data-testid='menu-btn'>
					Small
				</SidebarMenuButton>
			</SidebarProvider>,
		)
		expect(screen.getByTestId('menu-btn')).toHaveAttribute('data-size', 'sm')
	})

	it('renders with tooltip string', () => {
		render(
			<SidebarProvider>
				<SidebarMenuButton tooltip='Tooltip text' data-testid='menu-btn'>
					Button
				</SidebarMenuButton>
			</SidebarProvider>,
		)
		expect(screen.getByTestId('tooltip')).toBeInTheDocument()
	})

	it('accepts custom className', () => {
		render(
			<SidebarProvider>
				<SidebarMenuButton className='custom-btn'>Button</SidebarMenuButton>
			</SidebarProvider>,
		)
		const btn = document.querySelector('[data-slot="sidebar-menu-button"]')
		expect(btn).toHaveClass('custom-btn')
	})
})

describe('SidebarMenuAction', () => {
	it('renders with data-slot', () => {
		render(
			<SidebarProvider>
				<SidebarMenuAction data-testid='action'>Action</SidebarMenuAction>
			</SidebarProvider>,
		)
		expect(screen.getByTestId('action')).toHaveAttribute('data-slot', 'sidebar-menu-action')
	})

	it('accepts custom className', () => {
		render(
			<SidebarProvider>
				<SidebarMenuAction className='custom-action'>Action</SidebarMenuAction>
			</SidebarProvider>,
		)
		const action = document.querySelector('[data-slot="sidebar-menu-action"]')
		expect(action).toHaveClass('custom-action')
	})
})

describe('SidebarMenuBadge', () => {
	it('renders with data-slot', () => {
		render(
			<SidebarProvider>
				<SidebarMenuBadge data-testid='badge'>5</SidebarMenuBadge>
			</SidebarProvider>,
		)
		expect(screen.getByTestId('badge')).toHaveAttribute('data-slot', 'sidebar-menu-badge')
	})

	it('accepts custom className', () => {
		render(
			<SidebarProvider>
				<SidebarMenuBadge className='custom-badge'>5</SidebarMenuBadge>
			</SidebarProvider>,
		)
		const badge = document.querySelector('[data-slot="sidebar-menu-badge"]')
		expect(badge).toHaveClass('custom-badge')
	})
})

describe('SidebarMenuSkeleton', () => {
	it('renders with data-slot', () => {
		render(
			<SidebarProvider>
				<SidebarMenuSkeleton data-testid='skeleton' />
			</SidebarProvider>,
		)
		expect(screen.getByTestId('skeleton')).toHaveAttribute('data-slot', 'sidebar-menu-skeleton')
	})

	it('does not render icon skeleton by default', () => {
		const { container } = render(
			<SidebarProvider>
				<SidebarMenuSkeleton />
			</SidebarProvider>,
		)
		expect(container.querySelector('[data-sidebar="menu-skeleton-icon"]')).not.toBeInTheDocument()
	})

	it('renders icon skeleton when showIcon is true', () => {
		const { container } = render(
			<SidebarProvider>
				<SidebarMenuSkeleton showIcon />
			</SidebarProvider>,
		)
		expect(container.querySelector('[data-sidebar="menu-skeleton-icon"]')).toBeInTheDocument()
	})

	it('always renders text skeleton', () => {
		const { container } = render(
			<SidebarProvider>
				<SidebarMenuSkeleton />
			</SidebarProvider>,
		)
		expect(container.querySelector('[data-sidebar="menu-skeleton-text"]')).toBeInTheDocument()
	})

	it('accepts custom className', () => {
		render(
			<SidebarProvider>
				<SidebarMenuSkeleton className='custom-skeleton' />
			</SidebarProvider>,
		)
		const skeleton = document.querySelector('[data-slot="sidebar-menu-skeleton"]')
		expect(skeleton).toHaveClass('custom-skeleton')
	})
})

describe('SidebarMenuSub', () => {
	it('renders with data-slot', () => {
		render(
			<SidebarProvider>
				<SidebarMenuSub data-testid='sub'>
					<li>Sub item</li>
				</SidebarMenuSub>
			</SidebarProvider>,
		)
		expect(screen.getByTestId('sub')).toHaveAttribute('data-slot', 'sidebar-menu-sub')
	})

	it('accepts custom className', () => {
		render(
			<SidebarProvider>
				<SidebarMenuSub className='custom-sub'>
					<li>Sub item</li>
				</SidebarMenuSub>
			</SidebarProvider>,
		)
		const sub = document.querySelector('[data-slot="sidebar-menu-sub"]')
		expect(sub).toHaveClass('custom-sub')
	})
})

describe('SidebarMenuSubItem', () => {
	it('renders with data-slot', () => {
		render(
			<SidebarProvider>
				<SidebarMenuSubItem data-testid='sub-item'>Sub item</SidebarMenuSubItem>
			</SidebarProvider>,
		)
		expect(screen.getByTestId('sub-item')).toHaveAttribute('data-slot', 'sidebar-menu-sub-item')
	})

	it('accepts custom className', () => {
		render(
			<SidebarProvider>
				<SidebarMenuSubItem className='custom-sub-item'>Sub item</SidebarMenuSubItem>
			</SidebarProvider>,
		)
		const subItem = document.querySelector('[data-slot="sidebar-menu-sub-item"]')
		expect(subItem).toHaveClass('custom-sub-item')
	})
})

describe('SidebarMenuSubButton', () => {
	it('renders with data-slot', () => {
		render(
			<SidebarProvider>
				<SidebarMenuSubButton data-testid='sub-btn'>Sub button</SidebarMenuSubButton>
			</SidebarProvider>,
		)
		expect(screen.getByTestId('sub-btn')).toHaveAttribute('data-slot', 'sidebar-menu-sub-button')
	})

	it('sets data-active when isActive is true', () => {
		render(
			<SidebarProvider>
				<SidebarMenuSubButton isActive data-testid='sub-btn'>
					Active
				</SidebarMenuSubButton>
			</SidebarProvider>,
		)
		expect(screen.getByTestId('sub-btn')).toHaveAttribute('data-active', 'true')
	})

	it('passes size prop as data-size', () => {
		render(
			<SidebarProvider>
				<SidebarMenuSubButton size='sm' data-testid='sub-btn'>
					Small
				</SidebarMenuSubButton>
			</SidebarProvider>,
		)
		expect(screen.getByTestId('sub-btn')).toHaveAttribute('data-size', 'sm')
	})

	it('accepts custom className', () => {
		render(
			<SidebarProvider>
				<SidebarMenuSubButton className='custom-sub-btn'>Sub button</SidebarMenuSubButton>
			</SidebarProvider>,
		)
		const subBtn = document.querySelector('[data-slot="sidebar-menu-sub-button"]')
		expect(subBtn).toHaveClass('custom-sub-btn')
	})
})
