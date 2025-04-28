module.exports = {
    apps: [
        {
            name: 'mosinna_backend',
            script: 'npm',
            args: 'run deploy',
            env: {
                NODE_ENV: 'production',
                RESOURCES_PATH: 'https://mosinna.gxiangsoft.com/resources',
            },
        },
    ],
}
