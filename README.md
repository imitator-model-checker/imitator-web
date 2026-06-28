# imitator-web

Graphical web interface to run Imitator jobs in Docker containers and stream command output to the browser in real time.

## Requirements

- [Node.js](https://nodejs.org/en/) >= 24
- [Yarn](https://yarnpkg.com/)
- Docker available to the application process

## Run

Install dependencies:

```bash
yarn install
```

Start the AdonisJS development server:

```bash
yarn dev
```

Build and run the production server:

```bash
yarn build
yarn start
```

## Architecture

The server has been ported to AdonisJS 7 and organized around a hexagonal architecture:

- `app/domain`: framework-free contracts and domain helpers.
- `app/application`: use cases for running, stopping, and downloading jobs.
- `app/infrastructure`: Docker, filesystem, benchmark, scheduler, and Transmit/SSE adapters.
- `app/controllers`: HTTP adapters that translate Adonis requests into use case input.
- `resources/views`: Edge templates replacing the previous Pug views.
- `old`: archived Express/Pug implementation kept for reference only.

## Configuration

- `UPLOAD_FOLDER`: folder where run output files are saved temporarily. Default: `/tmp/imitator-runner`.
- `BENCHMARKS_FOLDER`: folder where benchmark files are stored. Default: `./benchmarks`.
- `DOCKER_API`: Docker Hub API endpoint used to fetch Imitator tags. Default: `https://hub.docker.com/v2/repositories/imitator/imitator`.
- `TIME_LIMIT_FILES`: number of days before generated output folders are cleaned. Default: `7`.
- `HOST`: host used by the Adonis server. Default: Adonis default.
- `PORT`: server port. Default: `3000`.
- `APP_KEY`: encryption key used by Adonis internals. Set a secret value in production.

## Production

The historical production configuration can be adapted through `ecosystem.config.cjs`:

```javascript
env_production: {
  NODE_ENV: 'production',
  UPLOAD_FOLDER: '/data/imitator',
  BENCHMARKS_FOLDER: '/root/imitator/imitator/benchmarks',
  PORT: 3001,
  HOST: '0.0.0.0',
}
```
