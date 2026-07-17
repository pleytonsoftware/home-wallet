'use client'

import { SessionProvider } from 'next-auth/react'

interface AuthProviderProps extends React.PropsWithChildren {
	session: React.ComponentProps<typeof SessionProvider>['session']
}

export function AuthProvider({ children, session }: AuthProviderProps) {
	return <SessionProvider session={session}>{children}</SessionProvider>
}
