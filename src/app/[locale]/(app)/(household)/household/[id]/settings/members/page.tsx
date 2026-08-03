import { PreviousMembersList } from '@households/components/household-settings/previous-members-list'
import { RolesTransferList } from '@households/components/household-settings/roles-transfer-list'

export default function HouseholdRolesSettingsPage() {
	return (
		<div className='flex flex-col gap-6'>
			<RolesTransferList />
			<PreviousMembersList />
		</div>
	)
}
