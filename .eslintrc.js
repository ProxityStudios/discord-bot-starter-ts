/** @type {import("eslint").ESLint.ConfigData} */
module.exports = {
	root: true,
	plugins: ['@typescript-eslint'],
	extends: [
		'airbnb-base',
		'airbnb-typescript/base',
		'plugin:@typescript-eslint/recommended-type-checked',
		'plugin:@typescript-eslint/stylistic-type-checked',
		'plugin:import/typescript',
		'plugin:prettier/recommended',
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: true,
		tsconfigRootDir: __dirname,
	},
	rules: {
		'no-prototype-builtins': 'off',
		'import/prefer-default-export': 'off',
		'import/no-default-export': 'off',
		'@typescript-eslint/no-unused-vars': 'warn',
		'@typescript-eslint/no-explicit-any': 'warn',
		'@typescript-eslint/no-unsafe-assignment': 'warn',
		'@typescript-eslint/no-unsafe-member-access': 'warn',
		'no-use-before-define': [
			'error',
			{ functions: false, classes: true, variables: true },
		],
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/no-use-before-define': [
			'error',
			{
				functions: false,
				classes: true,
				variables: true,
				typedefs: true,
			},
		],
		'class-methods-use-this': 'off',
	},
	env: {
		node: true,
	},
	overrides: [
		{
			files: ['*.js'],
			extends: ['plugin:@typescript-eslint/disable-type-checked'],
			rules: {
				'@typescript-eslint/internal/no-poorly-typed-ts-props': 'off',
				'@typescript-eslint/explicit-function-return-type': 'off',
			},
		},
	],
};
