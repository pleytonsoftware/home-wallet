/* eslint-disable @next/next/no-html-link-for-pages */
import { Compass } from 'lucide-react'

import { render, screen } from '@testing-library/react'

import { StatusScreen } from './status-screen'

describe('StatusScreen', () => {
	it('renders the code, title and description', () => {
		render(<StatusScreen code='404' icon={Compass} title='Page not found' description='It seems this page moved out.' />)

		expect(screen.getByText('404')).toBeInTheDocument()
		expect(screen.getByRole('heading', { name: 'Page not found' })).toBeInTheDocument()
		expect(screen.getByText('It seems this page moved out.')).toBeInTheDocument()
	})

	it('renders the CTA children', () => {
		render(
			<StatusScreen code='404' icon={Compass} title='Page not found' description='desc'>
				<a href='/'>Home</a>
			</StatusScreen>,
		)

		expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument()
	})

	it('applies the destructive tone to the icon badge', () => {
		const { container } = render(<StatusScreen code='500' icon={Compass} title='Error' description='desc' tone='destructive' />)

		expect(container.querySelector('.bg-destructive\\/10')).toBeInTheDocument()
	})

	it('defaults to the primary tone', () => {
		const { container } = render(<StatusScreen code='404' icon={Compass} title='Not found' description='desc' />)

		expect(container.querySelector('.bg-primary\\/10')).toBeInTheDocument()
	})

	it('renders the ghost numeral for the hero variant', () => {
		render(<StatusScreen code='404' icon={Compass} title='Not found' description='desc' />)

		expect(screen.getByText('404')).toBeInTheDocument()
	})

	it('omits the ghost numeral in the panel variant', () => {
		render(<StatusScreen variant='panel' code='500' icon={Compass} title='Failed' description='desc' />)

		expect(screen.queryByText('500')).not.toBeInTheDocument()
	})
})
