import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ConfirmSaveButton } from './confirm-save-button'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => `common.confirm.save.${key}`,
}))

describe('ConfirmSaveButton', () => {
	it('renders the default save label on the trigger', () => {
		render(<ConfirmSaveButton />)
		expect(screen.getByRole('button', { name: 'common.confirm.save.save' })).toBeInTheDocument()
	})

	it('renders custom children on the trigger', () => {
		render(<ConfirmSaveButton>Persist</ConfirmSaveButton>)
		expect(screen.getByRole('button', { name: 'Persist' })).toBeInTheDocument()
	})

	it('renders the trigger as a non-submitting button', () => {
		render(<ConfirmSaveButton />)
		expect(screen.getByRole('button', { name: 'common.confirm.save.save' })).toHaveAttribute('type', 'button')
	})

	it('keeps the dialog closed until the trigger is clicked', () => {
		render(<ConfirmSaveButton />)
		expect(screen.queryByText('common.confirm.save.title')).not.toBeInTheDocument()
	})

	it('opens the dialog with default title, cancel and confirm labels', async () => {
		const user = userEvent.setup()
		render(<ConfirmSaveButton />)

		await user.click(screen.getByRole('button', { name: 'common.confirm.save.save' }))

		expect(screen.getByText('common.confirm.save.title')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'common.confirm.save.cancel' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'common.confirm.save.confirm' })).toBeInTheDocument()
	})

	it('renders custom dialog title and description', async () => {
		const user = userEvent.setup()
		render(<ConfirmSaveButton dialogTitle='Save changes?' dialogDescription='This will overwrite the settings.' />)

		await user.click(screen.getByRole('button', { name: 'common.confirm.save.save' }))

		expect(screen.getByText('Save changes?')).toBeInTheDocument()
		expect(screen.getByText('This will overwrite the settings.')).toBeInTheDocument()
	})

	it('renders custom cancel and confirm labels', async () => {
		const user = userEvent.setup()
		render(<ConfirmSaveButton cancel='Nope' confirm='Yes, save' />)

		await user.click(screen.getByRole('button', { name: 'common.confirm.save.save' }))

		expect(screen.getByRole('button', { name: 'Nope' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'Yes, save' })).toBeInTheDocument()
	})

	it('associates the confirm action with the given form via type submit', async () => {
		const user = userEvent.setup()
		render(<ConfirmSaveButton formId='my-form' />)

		await user.click(screen.getByRole('button', { name: 'common.confirm.save.save' }))

		const confirm = screen.getByRole('button', { name: 'common.confirm.save.confirm' })
		expect(confirm).toHaveAttribute('type', 'submit')
		expect(confirm).toHaveAttribute('form', 'my-form')
	})

	it('submits the associated form when confirm is clicked', async () => {
		const user = userEvent.setup()
		const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault())
		render(
			<>
				<form id='my-form' onSubmit={onSubmit} />
				<ConfirmSaveButton formId='my-form' />
			</>,
		)

		await user.click(screen.getByRole('button', { name: 'common.confirm.save.save' }))
		await user.click(screen.getByRole('button', { name: 'common.confirm.save.confirm' }))

		expect(onSubmit).toHaveBeenCalledTimes(1)
	})

	it('forwards button props to the trigger', () => {
		render(<ConfirmSaveButton disabled />)
		expect(screen.getByRole('button', { name: 'common.confirm.save.save' })).toBeDisabled()
	})

	it('does not render a description when none is provided', async () => {
		const user = userEvent.setup()
		render(<ConfirmSaveButton />)

		await user.click(screen.getByRole('button', { name: 'common.confirm.save.save' }))

		expect(document.querySelector('[data-slot="alert-dialog-description"]')).not.toBeInTheDocument()
	})

	it('renders dialogChildren between the description and the footer', async () => {
		const user = userEvent.setup()
		render(<ConfirmSaveButton dialogChildren={<p>Extra content</p>} />)

		await user.click(screen.getByRole('button', { name: 'common.confirm.save.save' }))

		expect(screen.getByText('Extra content')).toBeInTheDocument()
	})

	it('does not disable the confirm action by default', async () => {
		const user = userEvent.setup()
		render(<ConfirmSaveButton />)

		await user.click(screen.getByRole('button', { name: 'common.confirm.save.save' }))

		expect(screen.getByRole('button', { name: 'common.confirm.save.confirm' })).not.toBeDisabled()
	})

	it('disables the confirm action when confirmDisabled is true', async () => {
		const user = userEvent.setup()
		render(<ConfirmSaveButton confirmDisabled />)

		await user.click(screen.getByRole('button', { name: 'common.confirm.save.save' }))

		expect(screen.getByRole('button', { name: 'common.confirm.save.confirm' })).toBeDisabled()
	})

	it('defaults the confirm action to the default variant', async () => {
		const user = userEvent.setup()
		render(<ConfirmSaveButton />)

		await user.click(screen.getByRole('button', { name: 'common.confirm.save.save' }))

		expect(screen.getByRole('button', { name: 'common.confirm.save.confirm' })).toHaveAttribute('data-variant', 'default')
	})

	it('applies a custom confirmVariant to the confirm action', async () => {
		const user = userEvent.setup()
		render(<ConfirmSaveButton confirmVariant='destructive' />)

		await user.click(screen.getByRole('button', { name: 'common.confirm.save.save' }))

		expect(screen.getByRole('button', { name: 'common.confirm.save.confirm' })).toHaveAttribute('data-variant', 'destructive')
	})

	it('calls onOpenChange when the dialog opens and closes', async () => {
		const user = userEvent.setup()
		const onOpenChange = vi.fn()
		render(<ConfirmSaveButton onOpenChange={onOpenChange} />)

		await user.click(screen.getByRole('button', { name: 'common.confirm.save.save' }))
		expect(onOpenChange).toHaveBeenCalledWith(true)

		await user.click(screen.getByRole('button', { name: 'common.confirm.save.cancel' }))
		expect(onOpenChange).toHaveBeenCalledWith(false)
	})
})
