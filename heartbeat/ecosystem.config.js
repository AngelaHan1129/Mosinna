module.exports = {
  apps: [
    {
      name: "mosinna_heartbeat",
      script: "npm",
      args: 'start',
      interpreter: process.platform === 'win32' && 'C:\\Windows\\System32\\cmd.exe',
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
