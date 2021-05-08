module.exports = {
  uploadFolder: process.env.UPLOAD_FOLDER || '/tmp/imitator-runner',
  benchmarksFolder: process.env.BENCHMARKS_FOLDER || './benchmarks',
  imitatorMode: process.env.IMITATOR_MODE || 'binary',
  imitatorPath: process.env.IMITATOR_PATH || 'imitator',
  timeLimit: process.env.TIME_LIMIT_FILES || '7', // in days
  port: process.env.PORT || '3000',
};
