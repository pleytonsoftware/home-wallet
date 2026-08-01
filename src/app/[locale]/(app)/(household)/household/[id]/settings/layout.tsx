import type { PropsWithChildren } from 'react'

import { SettingsShell } from '@households/components/household-settings/settings-shell'

export default function HouseholdSettingsLayout({ children }: PropsWithChildren) {
	return <SettingsShell>{children}</SettingsShell>
}
