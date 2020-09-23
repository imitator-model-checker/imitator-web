const path = require('path');
const fs = require('fs');
const express = require('express');
const config = require('../config');
const upload = require('../libs/multer');
const { runImitator } = require('../libs/imitator');

const router = express.Router();

/**
 * @swagger
 *
 * /api/imitator:
 *  get:
 *    description: Get welcome message
 *    tags:
 *      - imitator
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: OK
 */
router.get('/', (req, res) => {
  res.json({ message: 'Imitator API' });
});

/**
 * @swagger
 *
 * /api/imitator/run:
 *  post:
 *    description: Run imitator
 *    tags:
 *      - imitator
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              model:
 *                description: imitator model
 *                required: true
 *                type: string
 *                format: byte
 *              property:
 *                description: imitator property
 *                required: true
 *                type: string
 *                format: byte
 *              options:
 *                description: imitator options
 *                type: string
 *              timeout:
 *                description: timeout of execution
 *                type: string
 *    responses:
 *      200:
 *        description: Information about the imitator execution
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                result:
 *                  type: object
 *                  properties:
 *                    model:
 *                      description: imitator model
 *                      type: string
 *                    property:
 *                      description: imitator property
 *                      type: string
 *                    options:
 *                      description: imitator options
 *                      type: string
 *                    file:
 *                      description: filename of the zipped file
 *                      type: string
 *                    output:
 *                      description: imitator output
 *                      type: string
 */
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

/**
 * @swagger
 *
 * /api/imitator/download:
 *  post:
 *    description: Download imitator output
 *    tags:
 *      - imitator
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              file:
 *                description: filename of the imitator output
 *                type: string
 *    responses:
 *      200:
 *        description: compressed file with imitator output
 *        content:
 *          application/octet-stream:
 *            schema:
 *              type: string
 *              format: binary
 */
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
