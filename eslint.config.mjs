import ljharb from '@ljharb/eslint-config/flat';

export default [
	...ljharb,
	{
		rules: {
			'func-style': ['error', 'declaration'],
			'id-length': 'off',
		},
	},
	{
		files: ['index.js'],
		rules: {
			'new-cap': [
				'error', {
					capIsNewExceptions: ['GetIntrinsic'],
				},
			],
			'no-magic-numbers': 'off',
		},
	},
	{
		files: ['test/**'],
		rules: {
			'global-require': 'off',
			'no-extra-parens': 'off',
			'no-magic-numbers': 'off',
			'no-underscore-dangle': 'off',
			'sort-keys': 'off',
		},
	},
];
