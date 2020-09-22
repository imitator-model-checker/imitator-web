const fs = require('fs');
const path = require('path');
const stripAnsi = require('strip-ansi');
const { spawn } = require('child_process');
const { zipFiles } = require('../libs/archiver');

/**
 * Run imitator
 *
 * @param {String} model Absoule path of the imitator model file
 * @param {String} property  Absolute path of the imitator property file
 * @param {Array<String>} options List of imitator options
 *
 * @returns Promise<String>
 */
function runImitator(model, property, options) {
  return new Promise((resolve, reject) => {
    // imitator output filename
    const outputFilename = model.replace('model-', '').replace('.imi', '');

    // result of imitator
    const result = {
      output: '',
      error: '',
    };

    // imitator command
    const imitator = spawn('imitator', [
      model,
      property,
      '-output-prefix',
      outputFilename,
      ...options,
    ]);

    // accumulate imitator output
    imitator.stdout.on('data', (stdout) => {
      // @ts-ignore
      result.output += stripAnsi(stdout.toString());
    });

    // accumulate imitator error output
    imitator.stderr.on('data', (stderr) => {
      // @ts-ignore
      result.error += stripAnsi(stderr.toString());
    });

    // return result when imitator finishes
    imitator.on('exit', async (code) => {
      try {
        const outputPath = `${outputFilename}.res`;

        // zip files
        const zipFile = await zipFiles(path.dirname(outputFilename), [
          { path: model, name: 'model.imi', type: 'file' },
          { path: property, name: 'property.imiprop', type: 'file' },
          { path: outputPath, name: 'output.res', type: 'file' },
          { path: result.output, name: 'stdout.txt', type: 'string' },
        ]);

        // remove temporary files
        const filesToRemove = [model, property, outputPath];
        Promise.all(filesToRemove.map((f) => fs.promises.unlink(f)));

        code === 0
          ? resolve({ file: zipFile, output: result.output })
          : reject(result.error);
      } catch (err) {
        reject(err);
      }
    });

    // catch error
    imitator.on('error', (error) => reject(error));
  });
}

module.exports = { runImitator };
