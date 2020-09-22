const fs = require('fs');
const stripAnsi = require('strip-ansi');
const { spawn } = require('child_process');

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
      const filesToRemove = [model, property];
      Promise.all(filesToRemove.map((f) => fs.promises.unlink(f)));

      code === 0 ? resolve(result.output) : reject(result.error);
    });

    // catch error
    imitator.on('error', (error) => reject(error));
  });
}

module.exports = { runImitator };
