module.exports = {
    apps: [
        {
            name: 'mosinna_backend',
            script: 'npm',
            args: 'start',
            interpreter:
                process.platform === 'win32' &&
                'C:\\Windows\\System32\\cmd.exe',
            env: {
                NODE_ENV: 'production',
                RESOURCES_PATH: 'https://mosinna.gxiangsoft.com/resources',
            },
        },
    ],
}
