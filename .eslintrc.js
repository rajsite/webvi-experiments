module.exports = {
    extends: '@ni/eslint-config-javascript',
    env: {
        browser: true,
        es6: true
    },
    parserOptions: {
        sourceType: 'script',
        ecmaVersion: 2018
    },
    rules: {
        'no-console': 'off',
        'strict': ['error', 'function'],
        'func-names': ['error', 'never'],
        'max-len': 'off',
        'object-curly-spacing': ['error', 'never'],
        'one-var-declaration-per-line': 'off',
        'one-var': 'off',
        'quote-props': ['error', 'consistent-as-needed'],
        'space-before-function-paren': ['error', 'always'],
        'global-require': 'off',
        'import/extensions': ['error', 'always'],
        'import/no-dynamic-require': 'off',
        'import/no-extraneous-dependencies': 'off',
        'import/no-unresolved': 'off',
        'lines-around-directive': 'off',
        'max-classes-per-file': 'off',
        'no-multi-assign': 'off',
        'no-return-await': 'off',
        'no-shadow': 'off',
        'prefer-arrow-callback': 'off',
        'prefer-const': 'off',
        'prefer-destructuring': 'off',
        'prefer-template': 'off',
        'valid-typeof': 'off',
        'no-lonely-if': 'off'
    },
    overrides: [{
        files: ['.eslintrc.js'],
        env: {
            node: true
        },
        rules: {
            strict: ['error', 'never']
        }
    }]
};
