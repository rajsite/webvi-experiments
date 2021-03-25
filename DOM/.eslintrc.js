module.exports = {
    overrides: [
        {
            files: ['**/*.js'],
            env: {
                browser: false
            },
            globals: {
                window: true
            }
        }
    ]
};
