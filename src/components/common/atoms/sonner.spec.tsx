import type { ToasterProps } from 'sonner'

import { act } from 'react'

import { toast } from 'sonner'

import { render, waitFor } from '@testing-library/react'

import { Toaster } from './sonner'

const { themeMock } = vi.hoisted(() => ({ themeMock: { value: 'light' as string | undefined } }))

vi.mock('next-themes', () => ({
	useTheme: () => ({ theme: themeMock.value }),
}))

vi.mock('lucide-react', () => ({
	CircleCheckIcon: (props: React.ComponentProps<'svg'>) => <svg data-testid='icon-success' {...props} />,
	InfoIcon: (props: React.ComponentProps<'svg'>) => <svg data-testid='icon-info' {...props} />,
	TriangleAlertIcon: (props: React.ComponentProps<'svg'>) => <svg data-testid='icon-warning' {...props} />,
	OctagonXIcon: (props: React.ComponentProps<'svg'>) => <svg data-testid='icon-error' {...props} />,
	Loader2Icon: (props: React.ComponentProps<'svg'>) => <svg data-testid='icon-loading' {...props} />,
}))

beforeAll(() => {
	Object.defineProperty(window, 'matchMedia', {
		writable: true,
		value: vi.fn().mockImplementation((query) => ({
			matches: false,
			media: query,
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
		})),
	})
})

afterEach(() => {
	// The sonner toast store lives outside React, so toasts from one test can leak into the next.
	act(() => {
		toast.dismiss()
	})
})

// The `[data-sonner-toaster]` list only mounts once a toast is on-screen for that position, so every
// assertion needs at least one toast pushed before the element can be queried.
async function renderToasterWithToast(props?: ToasterProps) {
	render(<Toaster {...props} />)

	act(() => {
		toast.success('Saved')
	})

	return waitFor(() => {
		const toaster = document.querySelector('[data-sonner-toaster]')
		if (!toaster) throw new Error('toaster not found')
		return toaster as HTMLElement
	})
}

describe('Toaster', () => {
	beforeEach(() => {
		themeMock.value = 'light'
	})

	it('renders the toaster once a toast is shown', async () => {
		const toaster = await renderToasterWithToast()
		expect(toaster).toBeInTheDocument()
	})

	it('applies the toaster group className', async () => {
		const toaster = await renderToasterWithToast()
		expect(toaster).toHaveClass('toaster', 'group')
	})

	it('reflects the current theme from next-themes', async () => {
		themeMock.value = 'dark'
		const toaster = await renderToasterWithToast()
		expect(toaster).toHaveAttribute('data-sonner-theme', 'dark')
	})

	it('falls back to the system theme when next-themes reports none', async () => {
		themeMock.value = undefined
		const toaster = await renderToasterWithToast()
		// matchMedia is mocked to report no dark preference, so the system fallback resolves to 'light'.
		expect(toaster).toHaveAttribute('data-sonner-theme', 'light')
	})

	it('forwards additional ToasterProps to the underlying toaster', async () => {
		const toaster = await renderToasterWithToast({ position: 'top-center' })
		expect(toaster).toHaveAttribute('data-x-position', 'center')
		expect(toaster).toHaveAttribute('data-y-position', 'top')
	})

	it('renders the overridden icon for the toast', async () => {
		const toaster = await renderToasterWithToast()
		expect(toaster.querySelector('[data-testid="icon-success"]')).toBeInTheDocument()
	})
})
