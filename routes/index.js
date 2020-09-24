const path = require('path');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const utils = require('../libs/utils');
const upload = require('../libs/multer');
const { runImitator } = require('../libs/imitator');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('index');
});

/* POST imitator run. */
router.post('/run', upload, async (req, res) => {
  try {
    // @ts-ignore
    const models = req.files.models;

    // @ts-ignore
    const property = req.files.property[0];

    // @ts-ignore
    const timeout = req.body.timeout;

    // identifier of the run
    const identifier = uuidv4();
    const outputFolder = path.join(property.destination, identifier);

    const propertyPath = await utils.moveToFolder(outputFolder, [property]);
    const modelsPath = await utils.moveToFolder(outputFolder, models);

    // imitator options
    let options = req.body.options;
    options = options.length !== 0 ? options.trim().split(' ') : [];

    // imitator output
    const imitatorOutput = await runImitator(
      modelsPath[0],
      propertyPath[0],
      options,
      timeout,
      outputFolder
    );

    const result = {
      options,
      identifier,
      output: imitatorOutput.output,
      file: imitatorOutput.zip,
      generatedFiles: imitatorOutput.files,
      model: models[0].originalname,
      property: property.originalname,
    };

    res.render('result', { result });
  } catch (error) {
    res.render('error', {
      message: 'Oops',
      error: { status: 500, stack: error },
    });
  }
});

module.exports = router;
