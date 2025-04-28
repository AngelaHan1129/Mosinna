module.exports = {
  apps: [
    {
      name: "mosinna_heartbeat",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
