module.exports = {
    apps: [
      {
        name: "mosinna_heartbeat",
        script: "npm",
        args: "run dev",
        env: {
          NODE_ENV: "production",
        },
      },
    ],
  };