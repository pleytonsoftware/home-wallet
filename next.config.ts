import type { NextConfig } from 'next'

import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
	webpack(config) {
		const fileLoaderRule = config.module.rules.find((rule: { test: RegExp }) => rule.test?.test?.('.svg'))

		config.module.rules.push(
			{
				...fileLoaderRule,
				type: 'javascript/auto',
				test: /\.svg$/i,
				resourceQuery: /url/, // *.svg?url
			},
			{
				test: /\.svg$/i,
				type: 'javascript/auto',
				issuer: fileLoaderRule.issuer,
				resourceQuery: { not: [...fileLoaderRule.resourceQuery.not, /url/] }, // exclude if *.svg?url
				use: ['@svgr/webpack'],
			},
		)

		return config
	},
	turbopack: {
		rules: {
			'*.svg': {
				loaders: ['@svgr/webpack'],
				as: '*.js',
			},
		},
	},
}

const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)
