module.exports = {
  apps: [
    {
      name: "mosinna_heartbeat",
      script: "./pm2-npm.js",
      args: 'start',
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
