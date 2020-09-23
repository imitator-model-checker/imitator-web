const path = require('path');
const fs = require('fs');
const express = require('express');
const config = require('../config');
const upload = require('../libs/multer');
const { runImitator } = require('../libs/imitator');

const router = express.Router();

/* GET index. */
router.get('/', (req, res) => {
  res.json({ message: 'Imitator API' });
});

/* POST imitator run. */
router.post('/run', upload, async (req, res) => {
  try {
    // @ts-ignore
    const model = req.files.model[0];

    // @ts-ignore
    const property = req.files.property[0];

    // @ts-ignore
    const timeout = req.body.timeout || '';

    // imitator options
    let options = req.body.options || '';
    options = options.length !== 0 ? options.trim().split(' ') : [];

    // check required fields
    if (!model || !property) {
      throw new Error('Model and property fields are required');
    }

    // imitator output
    const result = await runImitator(
      model.path,
      property.path,
      options,
      timeout
    );

    res.json({
      result: {
        options,
        output: result.output,
        file: result.file,
        model: model.originalname,
        property: property.originalname,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/* POST download files */
router.post('/download', async (req, res) => {
  try {
    const file = req.body.file;
    if (!file) throw new Error('filename is required');

    // check if file exist
    const fullPath = path.join(config.uploadFolder, file);
    await fs.promises.access(fullPath);

    res.download(fullPath);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
