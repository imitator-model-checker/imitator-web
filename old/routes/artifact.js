const path = require('path');
const express = require('express');
const config = require('../config');
const utils = require('../libs/utils');
const { v4: uuidv4 } = require('uuid');
const { artifacts } = require('../config/artifact');
const { runArtifact, stopArtifact } = require('../libs/artifact');
const debug = require('debug')('imitator-runner:artifact-api');

const router = express.Router();

// list of available artifacts
const artifactNames = Object.keys(artifacts);

/**
 * @swagger
 *
 * /api/artifact:
 *  get:
 *    description: Get available artifacts
 *    tags:
 *      - artifact
 *    produces:
 *      - application/json
 *    responses:
 *      200:
 *        description: Available artifacts
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                artifacts:
 *                  type: array
 *                  items:
 *                    type: string
 */
router.get('/', (req, res) => {
  res.json({ artifacts: artifactNames });
});

/**
 * @swagger
 *
 * /api/artifact/run:
 *  post:
 *    description: Run artifact
 *    tags:
 *      - artifact
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              artifact:
 *                description: artifact name
 *                required: true
 *                type: string
 *              script:
 *                description: script to be executed
 *                required: true
 *                type: string
 *              options:
 *                description: artifact options
 *                type: string
 *    responses:
 *      200:
 *        description: Information about the artifact execution
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              properties:
 *                result:
 *                  type: object
 *                  properties:
 *                    name:
 *                      description: artifact
 *                      type: string
 *                    identifier:
 *                      description: job identifier
 *                      type: string
 *                    script:
 *                      description: script executed
 *                      type: string
 *                    options:
 *                      description: script options
 *                      type: string
 *                    output:
 *                      description: artifact output
 *                      type: string
 */
router.post('/run', async (req, res) => {
  try {
    const io = req.app.locals.io;

    // get artifact name
    const artifactName = req.body.artifact;

    // check required fields
    if (!artifactName || !artifactNames.includes(artifactName)) {
      throw new Error('Valid artifact name is required');
    }

    // get artifact information
    const artifact = artifacts[artifactName];
    debug('selected artifact: ', artifact);

    // get artifact script
    const script = req.body.script;

    // check valid script
    if (!artifact.scripts.includes(script)) {
      throw new Error('Valid script is required');
    }

    // artifact options
    let options = req.body.options || '';
    options = options.length !== 0 ? options.trim().split(' ') : [];

    // TODO: filter output option

    // output file
    const identifier = uuidv4();
    const outputFolder = path.join(config.uploadFolder, identifier);
    await utils.createFolder(outputFolder);

    const outputArg = artifact.output_arg;
    if (outputArg) {
      const outputFile = path.join(outputFolder, `${script}-output.txt`);
      options = options.concat([outputArg, outputFile]);
    }
    debug('artifact options: ', options);

    const output = await runArtifact(
      artifactName,
      artifact.image,
      script,
      options,
      outputFolder,
      io
    );
    debug('artifact output: ', output);

    const result = {
      name: artifactName,
      identifier: output.container,
      script,
      options,
    };

    debug('artifact result: ', result);

    res.json({ result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * @swagger
 *
 * /api/artifact/stop:
 *  post:
 *    description: Stop artifact
 *    tags:
 *      - artifact
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              identifier:
 *                description: job identifier
 *                type: string
 *                required: true
 *    responses:
 *      200:
 *        description: artifact stopped successfully
 */
router.post('/stop', async (req, res) => {
  try {
    const identifier = req.body.identifier;

    if (!identifier) {
      throw new Error('identifier is required');
    }

    debug('identifier: ', identifier);
    await stopArtifact(identifier);

    res.status(200).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
