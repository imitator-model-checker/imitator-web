const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = '/tmp/imitator-runner';

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },

  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + uuidv4());
  },
});

module.exports = multer({ storage });
