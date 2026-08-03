import { configureSync, getConsoleSink, getLogger } from '@logtape/logtape'

configureSync({
	sinks: {
		console: getConsoleSink(),
	},
	loggers: [
		{
			category: ['app'],
			lowestLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
			sinks: ['console'],
		},
		{
			category: ['app', 'prisma'],
			parentSinks: 'inherit',
		},
		{
			category: ['app', 'household'],
			parentSinks: 'inherit',
		},
		{
			category: ['app', 'bank-account'],
			parentSinks: 'inherit',
		},
		{
			category: ['app', 'auth'],
			parentSinks: 'inherit',
		},
	],
})

export { getLogger }
export const logger = getLogger(['app'])
export const prismaLogger = logger.getChild(['prisma'])
export const householdLogger = logger.getChild(['household'])
export const bankAccountLogger = logger.getChild(['bank-account'])
export const authLogger = logger.getChild(['auth'])
