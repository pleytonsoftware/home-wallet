'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@atoms/button'
import { Input } from '@atoms/input'
import { Spinner } from '@atoms/spinner'
import { ROUTES } from '@lib/constants/routes.const'

export default function OnboardingHouseholdPage() {
	const router = useRouter()
	const [householdName, setHouseholdName] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function handleCreateHousehold(e: React.FormEvent) {
		e.preventDefault()
		if (!householdName.trim()) {
			setError('Household name is required')
			return
		}

		setIsLoading(true)
		setError(null)

		try {
			const res = await fetch('/api/households', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: householdName }),
			})

			if (!res.ok) {
				const data = await res.json()
				throw new Error(data.error || 'Failed to create household')
			}

			router.push(ROUTES.DASHBOARD)
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred')
			setIsLoading(false)
		}
	}

	return (
		<div className='flex min-h-screen items-center justify-center bg-linear-to-br from-background to-muted p-4'>
			<div className='w-full max-w-md space-y-8'>
				<div className='space-y-2 text-center'>
					<h1 className='text-3xl font-bold tracking-tight'>Welcome to home-wallet</h1>
					<p className='text-sm text-muted-foreground'>Create a household to get started managing shared expenses</p>
				</div>

				<form onSubmit={handleCreateHousehold} className='space-y-4 rounded-lg border bg-card p-6 shadow-sm'>
					<div className='space-y-2'>
						<label htmlFor='household-name' className='text-sm font-medium'>
							Household Name
						</label>
						<Input
							id='household-name'
							type='text'
							placeholder='e.g., My House, Our Apartment'
							value={householdName}
							onChange={(e) => setHouseholdName(e.target.value)}
							disabled={isLoading}
							autoFocus
						/>
						<p className='text-xs text-muted-foreground'>This is the name of your shared household</p>
					</div>

					{error && (
						<div className='rounded-md bg-destructive/10 p-3'>
							<p className='text-sm font-medium text-destructive'>{error}</p>
						</div>
					)}

					<Button type='submit' disabled={isLoading} className='w-full'>
						{isLoading ? (
							<>
								<Spinner /> Creating...
							</>
						) : (
							'Create Household'
						)}
					</Button>
				</form>

				<div className='space-y-3 text-center text-sm text-muted-foreground'>
					<p>Once created, you can invite other household members to share expenses.</p>
				</div>
			</div>
		</div>
	)
}
