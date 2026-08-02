import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-plugin-prettier'
import unusedImports from 'eslint-plugin-unused-imports'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'

const eslintConfig = defineConfig([
	...nextVitals,
	...nextTs,
	// Override default ignores of eslint-config-next.
	globalIgnores([
		// Default ignores of eslint-config-next:
		'.next/**',
		'out/**',
		'build/**',
		'next-env.d.ts',
	]),
	{
		files: ['**/*.{ts,tsx}'],
		languageOptions: {
			ecmaVersion: 2020,
			globals: globals.browser,
		},
		plugins: {
			prettier,
			'unused-imports': unusedImports,
		},
		rules: {
			'react/react-in-jsx-scope': 'off',
			'prettier/prettier': 'warn',
			'no-console': 'off',
			'no-restricted-syntax': [
				'error',
				{
					selector: "CallExpression[callee.object.name='console']",
					message: "Do not use console.*. Import and use '@lib/logger' instead.",
				},
				{
					selector: 'ImportDeclaration[source.value=/^@\\/components\\/atoms/]',
					message: "Use '@atoms/...' instead of '@/components/atoms/...'",
				},
			],
			'no-debugger': 'error',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			'react-hooks/exhaustive-deps': 'off',
			'import/order': 'off',
			'import/first': 'off',
			'import/newline-after-import': 'off',
			'no-shadow': 'off',

			// Exports
			'import/no-default-export': 'error',

			// Imports
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{
					prefer: 'type-imports',
				},
			],

			// Cleanse
			'unused-imports/no-unused-imports': 'error',
			// Architecture
			'import/no-cycle': 'error',
			'import/no-unresolved': 'error',

			// Avoid long routes
			'no-restricted-imports': [
				'error',
				{
					patterns: ['../*', '../../*', '../../../*', '../../../../*', '@/components/*/*'],
				},
			],
		},
	},
	{
		files: [
			'src/app/**/page.tsx',
			'src/app/**/layout.tsx',
			'src/app/**/loading.tsx',
			'src/app/**/error.tsx',
			'src/app/**/forbidden.tsx',
			'src/app/**/not-found.tsx',
			'*.config.ts',
			'src/proxy.ts',
			'src/i18n/request.ts',
			'src/emails/*.tsx',
		],
		rules: {
			'import/no-default-export': 'off',
		},
	},
])

export default eslintConfig
