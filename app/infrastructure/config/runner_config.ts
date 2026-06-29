import env from '#start/env'

const zenodoBenchmarksArchive =
  'https://zenodo.org/api/records/10600092/files/benchmarks.zip/content'

export const runnerConfig = {
  uploadFolder: env.get('UPLOAD_FOLDER', '/tmp/imitator-runner'),
  benchmarksFolder: env.get('BENCHMARKS_FOLDER', './benchmarks'),
  benchmarksAutoDownload: env.get('BENCHMARKS_AUTO_DOWNLOAD', true),
  benchmarksArchiveUrl: env.get('BENCHMARKS_ARCHIVE_URL', zenodoBenchmarksArchive),
  benchmarksArchiveChecksum: env.get(
    'BENCHMARKS_ARCHIVE_CHECKSUM',
    'md5:85b83375de1dc12cc25c11c374b3aaa0'
  ),
  benchmarksDownloadTimeoutMs: env.get('BENCHMARKS_DOWNLOAD_TIMEOUT_MS', 30000),
  dockerApi: env.get('DOCKER_API', 'https://hub.docker.com/v2/repositories/imitator/imitator'),
  timeLimitFiles: env.get('TIME_LIMIT_FILES', 7),
  port: env.get('PORT', 3000),
}
