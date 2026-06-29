# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-06-29

First release of the rewritten **imitator-web** application. The legacy
Express/Pug implementation has been fully replaced by an AdonisJS 7 TypeScript
app built around a hexagonal architecture. The previous code is archived under
`old/` for reference only.

### Added

- AdonisJS 7 application organized into `domain`, `application`,
  `infrastructure`, and `controllers` layers (hexagonal architecture).
- Imitator runner page (`/`) to launch Imitator models, optionally using
  benchmark files, with selectable Imitator Docker image tags fetched from
  Docker Hub.
- Artifact runner page (`/artifact`) to run configured artifact scripts in
  Docker.
- Real-time command output streamed to the browser over Server-Sent Events
  using Adonis Transmit (`imitator-output` and `artifact-output` channels).
- Docker command builder with support for user permissions, mutable tags, and a
  fresh-pull option.
- Benchmark hydration: on startup the app downloads, checksum-verifies, and
  extracts `benchmarks.zip` from the Zenodo record `10600092` when the
  benchmarks folder is empty and auto-download is enabled.
- File generation and download via
  `GET /api/imitator/download/:identifier/:file`, with download links opening in
  a new browser context to keep live run status visible.
- Scheduled cleanup (`node-cron`) of generated output folders older than
  `TIME_LIMIT_FILES` days.
- Tailwind-based UI with shadcn-style design tokens, light/dark mode logos, and
  improved mobile navigation.
- Environment-based configuration for upload/benchmark folders, archive URL and
  checksum, Docker API endpoint, file retention, host, port, and `APP_KEY`.
- PM2 deployment support via `ecosystem.config.cjs` and `pm2:*` npm scripts.
- Project documentation: `README.md` and `AUTHORS.md`.

[2.0.0]: https://github.com/imitator-model-checker/imitator-web/releases/tag/v2.0.0
