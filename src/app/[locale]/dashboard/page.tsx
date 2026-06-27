import { redirect } from 'next/navigation'

import { SignOutButton } from '@auth/components/signout'
import { auth } from '@lib/auth'
import { ROUTES } from '@lib/constants/routes.const'
import { prisma } from '@lib/prisma'

export default async function DashboardPage() {
	const session = await auth()

	if (!session) {
		redirect(ROUTES.SIGNIN)
	}

	const householdMembers = await prisma.householdMember.findMany({
		where: { userId: session.user.id },
		include: { household: true },
	})

	return (
		<div>
			<p>Protected content {session.user.email}</p> <SignOutButton />
			<h2>Household Memberships</h2>
			<ul className='list-disc pl-5'>
				{householdMembers.map((membership) => (
					<li key={membership.id} className='mb-2'>
						{membership.household.name} (Role: {membership.role})
					</li>
				))}
			</ul>
		</div>
	)
}
