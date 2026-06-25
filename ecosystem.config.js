module.exports = {
  apps: [
    {
      name: "affiniter",
      cwd: "/var/www/affiniter",
      script: "node_modules/.bin/next",
      args: "start -p 3000",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
      error_file: "/var/log/pm2/affiniter-error.log",
      out_file: "/var/log/pm2/affiniter-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
