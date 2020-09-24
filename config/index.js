module.exports = {
  uploadFolder: process.env.UPLOAD_FOLDER || '/tmp/imitator-runner',
  imitatorMode: process.env.IMITATOR_MODE || 'binary',
  imitatorPath: process.env.IMITATOR_PATH || 'imitator',
  port: process.env.PORT || '3000',
};
