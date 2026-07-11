import { useMediaQuery } from 'usehooks-ts'

import { screens } from '@lib/utils/breakpoints'

export function useIsMobile() {
	return useMediaQuery(`(max-width: calc(${screens.sm} - 1px))`)
}
