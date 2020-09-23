const fs = require('fs');
const path = require('path');
const multer = require('multer');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');

// multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folder = config.uploadFolder;

    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true });
    }

    cb(null, folder);
  },

  filename: function (req, file, cb) {
    cb(null, uuidv4() + path.extname(file.originalname));
  },
});

module.exports = multer({ storage });
