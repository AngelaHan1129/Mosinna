module.exports = {
    apps: [
        {
            name: 'mosinna_backend',
            script: 'npm',
            args: 'start',
            env: {
                NODE_ENV: 'production',
                RESOURCES_PATH: 'https://mosinna.gxiangsoft.com/resources',
            },
        },
    ],
}
