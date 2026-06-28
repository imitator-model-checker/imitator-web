module.exports = {
  apps: [
    {
      name: 'imitator-runner',
      script: './bin/www',
      watch: true,
      autorestart: true,
      ignore_watch: ['node_modules'],
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      env: {
        NODE_ENV: 'development',
        DEBUG: 'imitator-runner:*',
        IMITATOR_MODE: 'docker',
        IMITATOR_PATH: 'imitator/imitator:latest',
        BENCHMARKS_FOLDER: '../imitator/benchmarks',
      },
      env_production: {
        NODE_ENV: 'production',
        UPLOAD_FOLDER: '/data/imitator',
        BENCHMARKS_FOLDER: '/root/imitator/imitator/benchmarks',
        IMITATOR_MODE: 'docker',
        IMITATOR_PATH: 'imitator:latest',
        PORT: 3001,
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
      'post-deploy':
        'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
};
