// pm2 process manifest for connect.sarstage.online
// Run from this directory:  pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: "connect-backend",
      cwd: "./backend",
      script: "index.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 4005,
      },
      max_memory_restart: "500M",
    },
    {
      name: "connect-frontend",
      cwd: "./frontend",
      // Next.js standalone server (produced by: npm run build:standalone)
      script: ".next/standalone/server.js",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 4006,
        HOSTNAME: "127.0.0.1",
      },
      max_memory_restart: "600M",
    },
  ],
};
