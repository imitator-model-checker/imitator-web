# imitator-web

![Imitator logo](public/images/imitator.png)

Web interface for launching Imitator and artifact jobs in Docker containers, then streaming command output back to the browser in real time with Server-Sent Events.

## Requirements

- Node.js >= 24
- npm >= 11
- Docker available to the application process
- Access to the Imitator Docker images used by the configured jobs

## Quick Start

Install dependencies:

```bash
npm ci
```

Start the AdonisJS development server:

```bash
npm run dev
```

Build and run the production server:

```bash
npm run build
npm start
```

## Scripts

- `npm run dev`: builds the Tailwind stylesheet and starts AdonisJS with HMR.
- `npm run build`: builds CSS and compiles the AdonisJS application into `build/`.
- `npm start`: starts the compiled production server from `build/bin/server.js`.
- `npm run serve`: starts the AdonisJS server without HMR.
- `npm run lint`: runs ESLint.
- `npm run typecheck`: runs TypeScript checks without emitting files.

## Runtime

The application exposes two user-facing pages:

- `/`: run Imitator models, optionally using benchmark files.
- `/artifact`: run configured artifact scripts in Docker.

Realtime output is delivered with Adonis Transmit over SSE on `__transmit/*` routes. The browser subscribes to:

- `imitator-output`
- `artifact-output`

## Architecture

The active application is an AdonisJS 7 TypeScript app organized around hexagonal architecture:

- `app/domain`: framework-free contracts and domain helpers.
- `app/application`: use cases for running, stopping, and downloading jobs.
- `app/infrastructure`: Docker, filesystem, benchmark, scheduler, and Transmit/SSE adapters.
- `app/controllers`: HTTP adapters that translate Adonis requests into use case input.
- `resources/views`: Edge templates.
- `resources/css`: Tailwind source stylesheet.
- `public`: runtime static assets only.
- `old`: archived Express/Pug implementation kept for reference only.

## Configuration

Use environment variables to configure the runner:

- `UPLOAD_FOLDER`: folder where run output files are saved temporarily. Default: `/tmp/imitator-runner`.
- `BENCHMARKS_FOLDER`: folder where benchmark files are stored. Default: `./benchmarks`.
- `DOCKER_API`: Docker Hub API endpoint used to fetch Imitator tags. Default: `https://hub.docker.com/v2/repositories/imitator/imitator`.
- `TIME_LIMIT_FILES`: number of days before generated output folders are cleaned. Default: `7`.
- `HOST`: host used by the Adonis server.
- `PORT`: server port. Default: `3000`.
- `APP_KEY`: encryption key used by Adonis internals. Set a secret value in production.

## Production

Build before starting production:

```bash
npm ci
npm run build
npm start
```

The PM2 deployment file is `ecosystem.config.cjs`. Its production defaults are:

```javascript
env_production: {
  NODE_ENV: 'production',
  UPLOAD_FOLDER: '/data/imitator',
  BENCHMARKS_FOLDER: '/root/imitator/imitator/benchmarks',
  PORT: 3001,
  HOST: '0.0.0.0',
}
```

If your reverse proxy enables gzip, exclude `text/event-stream` so Transmit/SSE connections are not buffered or compressed.
