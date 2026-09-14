module.exports = {
  apps: [
    {
      name: 'catering-app',
      script: 'node',
      args: 'node_modules/next/dist/bin/next start -p 3001',
      cwd: '/root/multi-bot',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
  ],
}
