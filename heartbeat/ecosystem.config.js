module.exports = {
    apps: [
      {
        name: "mosinna_heartbeat",
        script: "./index.js",
        env: {
          NODE_ENV: "production",
        },
      },
    ],
  };