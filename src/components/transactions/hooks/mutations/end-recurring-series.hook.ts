import { endRecurringSeries } from '@actions/transaction/end-recurring-series'
import { mutationOptions } from '@tanstack/react-query'

type EndRecurringSeriesResponse = Awaited<ReturnType<typeof endRecurringSeries>>

export const endRecurringSeriesMutationOptions = (
	seriesId: string,
	opts?: Omit<Parameters<typeof mutationOptions<EndRecurringSeriesResponse, unknown, void, unknown>>[0], 'mutationFn'>,
) =>
	mutationOptions({
		mutationFn: async () => endRecurringSeries(seriesId),
		...opts,
	})
