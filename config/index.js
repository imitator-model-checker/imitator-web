module.exports = {
  uploadFolder: process.env.UPLOAD_FOLDER || '/tmp/imitator-runner',
  imitatorPath: process.env.IMITATOR_PATH || 'imitator',
  port: process.env.PORT || '3000',
};
