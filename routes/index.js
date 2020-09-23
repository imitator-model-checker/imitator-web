const express = require('express');
const multer = require('../libs/multer');
const { runImitator } = require('../libs/imitator');

const router = express.Router();

// accepted form fields
const uploadImitatorFiles = multer.fields([
  { name: 'model', maxCount: 1 },
  { name: 'property', maxCount: 1 },
]);

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index');
});

/* POST imitator run. */
router.post('/run', uploadImitatorFiles, async (req, res) => {
  try {
    // @ts-ignore
    const model = req.files.model[0];

    // @ts-ignore
    const property = req.files.property[0];

    // @ts-ignore
    const timeout = req.body.timeout;

    // imitator options
    let options = req.body.options;
    options = options.length !== 0 ? options.trim().split(' ') : [];

    // imitator output
    const result = await runImitator(
      model.path,
      property.path,
      options,
      timeout
    );

    res.render('result', {
      result: {
        options,
        output: result.output,
        file: result.file,
        model: model.originalname,
        property: property.originalname,
      },
    });
  } catch (error) {
    res.render('error', {
      message: 'Oops',
      error: { status: 500, stack: error },
    });
  }
});

/* POST download files */
router.post('/download', (req, res) => {
  const { file } = req.body;
  res.download(file);
});

module.exports = router;
