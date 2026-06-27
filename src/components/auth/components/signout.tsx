'use client'

import { signOut } from 'next-auth/react'

import { Button } from '@atoms/button'

export const SignOutButton = () => {
	const handleSignOut = async () => {
		await signOut({ callbackUrl: '/signin' })
	}

	return <Button onClick={handleSignOut}>Sign Out</Button>
}
