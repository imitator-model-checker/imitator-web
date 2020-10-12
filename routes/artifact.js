const express = require('express');
const { artifacts } = require('../config/artifact');
const { runArtifact } = require('../libs/artifact');
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

    const output = await runArtifact(
      artifactName,
      artifact.image,
      script,
      options,
      io
    );
    debug('artifact output: ', output);

    const result = {
      name: artifactName,
      script,
      options,
      output,
    };

    debug('artifact result: ', result);

    res.json({ result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
