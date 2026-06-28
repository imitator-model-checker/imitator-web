module.exports = {
  uploadFolder: process.env.UPLOAD_FOLDER || '/tmp/imitator-runner',
  benchmarksFolder: process.env.BENCHMARKS_FOLDER || './benchmarks',
  dockerAPI:
    process.env.DOCKER_API ||
    'https://hub.docker.com/v2/repositories/imitator/imitator',
  timeLimit: process.env.TIME_LIMIT_FILES || '7', // in days
  port: process.env.PORT || '3000',
};
