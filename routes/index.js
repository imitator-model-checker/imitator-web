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

    // imitator options
    const options = req.body.options.trim().split(' ');

    // imitator output
    const output = await runImitator(model.path, property.path, options);

    res.render('result', {
      result: {
        output,
        options,
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

module.exports = router;
