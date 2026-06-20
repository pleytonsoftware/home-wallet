import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-plugin-prettier'
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
		},
		rules: {
			'react/react-in-jsx-scope': 'off',
			'prettier/prettier': 'warn',
			'no-console': 'warn',
			'no-debugger': 'warn',
			'@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
			'react-hooks/exhaustive-deps': 'off',
			'import/order': 'off',
			'import/first': 'off',
			'import/newline-after-import': 'off',
			'no-shadow': 'off',
		},
	},
])

export default eslintConfig
