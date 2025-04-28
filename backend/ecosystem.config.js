module.exports = {
    apps: [
        {
            name: 'mosinna_backend',
            script: './src/index.js',
            env: {
                NODE_ENV: 'production',
                RESOURCES_PATH: 'https://mosinna.gxiangsoft.com/resources',
            },
        },
    ],
}
