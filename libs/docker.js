const axios = require('axios');
const config = require('../config/index');

/**
 * Get the versions of Imitator from Docker hub
 *
 * @returns Promise<Array<String>> array of imitator's version
 */
async function getImitatorVersions() {
  const { data } = await axios.get(`${config.dockerAPI}/tags`);
  const tags = data.results.map((t) => t.name);
  return tags;
}

/**
 * Return the command to execute imitator
 *
 * @param {String} mode execution mode
 *
 * @returns Array<String>
 */
function getImitatorCommand(model, property, options, outputFolder, version) {
  const volume = `${outputFolder}:${outputFolder}`;
  const propertyOptional = property ? [property] : [];
  const imitatorCmd = `imitator/imitator:${version}`;

  return {
    command: 'docker',
    imitatorArguments: [
      'run',
      '--rm',
      '-v',
      volume,
      imitatorCmd,
      ...options,
      model,
      ...propertyOptional,
    ],
  };
}

module.exports = {
  getImitatorVersions,
  getImitatorCommand,
};
