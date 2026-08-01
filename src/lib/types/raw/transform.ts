import type { MaybeDate } from './types'

export const transformDate = (maybeDate: MaybeDate<true>) => new Date(maybeDate)
