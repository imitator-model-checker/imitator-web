import env from '#start/env'

export const runnerConfig = {
  uploadFolder: env.get('UPLOAD_FOLDER', '/tmp/imitator-runner'),
  benchmarksFolder: env.get('BENCHMARKS_FOLDER', './benchmarks'),
  dockerApi: env.get('DOCKER_API', 'https://hub.docker.com/v2/repositories/imitator/imitator'),
  timeLimitFiles: env.get('TIME_LIMIT_FILES', 7),
  port: env.get('PORT', 3000),
}
