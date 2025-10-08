// eslint-disable-next-line import/extensions
const {defineConfig} = require('eslint/config');
const {javascriptConfig} = require('@ni/eslint-config-javascript');
const {browser, jasmine} = require('globals');

module.exports = defineConfig([{
    ignores: [
        '**/Builds/',
        '**/ThirdParty/',
        '**/dist/',
        '**/deps/',
        'ProgressiveWebApp/',
        'Deno/',
    ]
}, {
    files: ['**/*.js'],
    languageOptions: {
        sourceType: 'script',
        globals: {
            ...browser
        }
    },
    extends: javascriptConfig,
    rules: {
        'no-console': 'off',
        'strict': ['error', 'function'],
        'func-names': ['error', 'never'],
        'max-len': 'off',
        '@stylistic/object-curly-spacing': ['error', 'never'],
        '@stylistic/one-var-declaration-per-line': 'off',
        'one-var': 'off',
        '@stylistic/quote-props': ['error', 'consistent-as-needed'],
        '@stylistic/space-before-function-paren': ['error', 'always'],
        'global-require': 'off',
        'import/extensions': ['error', 'always'],
        'import/no-dynamic-require': 'off',
        'import/no-extraneous-dependencies': 'off',
        'import/no-unresolved': 'off',
        'lines-around-directive': 'off',
        'max-classes-per-file': 'off',
        'no-multi-assign': 'off',
        'no-shadow': 'off',
        'prefer-arrow-callback': 'off',
        'prefer-const': 'off',
        'prefer-destructuring': 'off',
        'prefer-template': 'off',
        'valid-typeof': 'off',
        'no-lonely-if': 'off',
        'require-await': 'off'
    }
}, {
    files: [
        'WebAudio/WebAudio.gcomp/Support/**/*.js',
        'VireoPatch/VireoPatch.gcomp/Support/**/*.js',
        'Perspective/Perspective.gcomp/Support/**/*.js',
    ],
    languageOptions: {
        sourceType: 'module'
    }
}, {
    files: [
        'IntegrationTest/**/*.js',
    ],
    languageOptions: {
        globals: {
            ...jasmine
        }
    }
}, {
    files: [
        'Map/Leaflet.gcomp/**/*.js',
    ],
    languageOptions: {
        globals: {
            L: false
        }
    }
}]);
