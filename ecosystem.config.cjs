// Load variables from the project-root .env file so all configuration lives in
// a single place. `process.loadEnvFile()` is built into Node >= 20.12 (this
// project requires Node 24), so no extra dependency is needed.
//
// On the server, create a `.env` next to this file (copy `.env.example`) with
// the production values. AdonisJS also reads `.env` on boot, so the variables
// stay in sync between pm2 and the app.
try {
  process.loadEnvFile()
} catch {
  // No .env file present (e.g. CI) — fall back to whatever is already in the
  // surrounding environment.
}

module.exports = {
  apps: [
    {
      name: 'imitator-runner',
      script: './build/bin/server.js',
      watch: false,
      autorestart: true,
      ignore_watch: ['node_modules'],
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      // Inherit every variable loaded from `.env`.
      env: {
        ...process.env,
      },
    },
  ],
}
