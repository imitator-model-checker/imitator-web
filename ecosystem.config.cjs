module.exports = {
  apps: [
    {
      name: 'imitator-runner',
      script: './build/bin/server.js',
      watch: false,
      autorestart: true,
      ignore_watch: ['node_modules'],
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      env: {
        NODE_ENV: 'development',
        BENCHMARKS_FOLDER: '../imitator/benchmarks',
      },
      env_production: {
        NODE_ENV: 'production',
        UPLOAD_FOLDER: '/data/imitator',
        BENCHMARKS_FOLDER: '/root/imitator/imitator/benchmarks',
        PORT: 3001,
        HOST: '0.0.0.0',
      },
    },
  ],

  deploy: {
    production: {
      user: 'SSH_USERNAME',
      host: 'SSH_HOSTMACHINE',
      ref: 'origin/master',
      repo: 'GIT_REPOSITORY',
      path: 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy': 'npm ci && npm run build && pm2 reload ecosystem.config.cjs --env production',
      'pre-setup': '',
    },
  },
}
