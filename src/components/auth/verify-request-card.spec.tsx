import { ROUTES } from '@lib/constants/routes.const'
import { render, screen } from '@testing-library/react'

import { VerifyRequestCard } from './verify-request-card'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

describe('VerifyRequestCard', () => {
	it('renders the title and subtitle', () => {
		render(<VerifyRequestCard />)
		expect(screen.getByText('title')).toBeInTheDocument()
		expect(screen.getByText('subtitle')).toBeInTheDocument()
	})

	it('renders a link back to the sign-in page', () => {
		render(<VerifyRequestCard />)
		const link = screen.getByRole('link', { name: 'back-to-sign-in' })
		expect(link).toHaveAttribute('href', ROUTES.SIGNIN)
	})
})
