import type { NextConfig } from 'next'

import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
	output: 'standalone',
	webpack(config) {
		const fileLoaderRule = config.module.rules.find((rule: { test: RegExp }) => rule.test?.test?.('.svg'))

		config.module.rules.push(
			{
				...fileLoaderRule,
				// type: 'javascript/auto',
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

		// Modify the file loader rule to ignore *.svg, since we have it handled now.
		fileLoaderRule.exclude = /\.svg$/i

		return config
	},
	turbopack: {
		rules: {
			'*.svg': [
				{
					loaders: ['@svgr/webpack'],
					as: '*.js',
					condition: { not: { query: /url/ } },
				},
				{
					type: 'asset',
					condition: { query: /url/ },
				},
			],
		},
	},
	env: {
		NEXT_PUBLIC_APP_NAME: process.env.APP_NAME,
		NEXT_PUBLIC_BASE_URL: process.env.BASE_URL,
	},
	experimental: {
		authInterrupts: true,
	},
}

const withNextIntl = createNextIntlPlugin()
export default withNextIntl(nextConfig)
