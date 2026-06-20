import type { AVAILABLE_LANGUAGE_CODES, DISABLED_LANGUAGE_CODES, LANGUAGE_CODES } from '@/i18n/languages'
import type { FC, SVGProps } from 'react'

import esCt from './es-ct.svg'
import esGa from './es-ga.svg'
import esPv from './es-pv.svg'
import es from './es.svg'
import gb from './gb.svg'
import pt from './pt.svg'

type FlagType = FC<SVGProps<SVGElement>>

export const AVAILABLE_LANGUAGE_FLAGS_DICTIONARY: Record<AVAILABLE_LANGUAGE_CODES, FlagType> = {
	en: gb,
	es: es,
}
export const DISABLED_LANGUAGE_FLAGS_DICTIONARY: Record<DISABLED_LANGUAGE_CODES, FlagType> = {
	pt: pt,
	ca: esCt,
	eu: esPv,
	gl: esGa,
}

export const ALL_LANGUAGE_FLAGS_DICTIONARY: Record<LANGUAGE_CODES, FlagType> = {
	...AVAILABLE_LANGUAGE_FLAGS_DICTIONARY,
	...DISABLED_LANGUAGE_FLAGS_DICTIONARY,
}
