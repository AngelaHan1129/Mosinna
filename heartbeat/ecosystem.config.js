module.exports = {
  apps: [
    {
      name: "mosinna_heartbeat",
      script: "npm",
      args: 'run deploy',
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
