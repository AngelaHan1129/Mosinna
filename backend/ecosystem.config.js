module.exports = {
    apps: [
        {
            name: 'mosinna_backend',
            script: './pm2-npm.js',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                RESOURCES_PATH: 'https://mosinna.gxiangsoft.com/resources',
            },
        },
    ],
}
