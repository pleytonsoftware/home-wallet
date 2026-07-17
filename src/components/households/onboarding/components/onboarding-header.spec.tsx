/* eslint-disable @next/next/no-img-element */
import { render, screen } from '@testing-library/react'

import { OnboardingHeader } from './onboarding-header'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('next/image', () => ({
	default: (props: React.ComponentProps<'img'>) => <img {...props} alt={props.alt} />,
}))

describe('OnboardingHeader', () => {
	it('renders the logo', () => {
		render(<OnboardingHeader view='create' />)
		expect(screen.getByRole('img')).toBeInTheDocument()
	})

	it('renders the title', () => {
		render(<OnboardingHeader view='create' />)
		expect(screen.getByRole('heading', { name: 'title' })).toBeInTheDocument()
	})

	it("renders the create view's description", () => {
		render(<OnboardingHeader view='create' />)
		expect(screen.getByText('create.description')).toBeInTheDocument()
	})

	it("renders the join view's description", () => {
		render(<OnboardingHeader view='join' />)
		expect(screen.getByText('join.description')).toBeInTheDocument()
	})
})
