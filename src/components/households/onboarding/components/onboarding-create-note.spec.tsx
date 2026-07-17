import { render, screen } from '@testing-library/react'

import { OnboardingCreateNote } from './onboarding-create-note'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

describe('OnboardingCreateNote', () => {
	it('renders the note text', () => {
		render(<OnboardingCreateNote />)
		expect(screen.getByText('note')).toBeInTheDocument()
	})
})
