const stripAnsi = require('strip-ansi');
const { spawn } = require('child_process');

/**
 *
 * @param {String} name artifact name
 * @param {String} image Docker image of the artifact
 * @param {String} script script to be executed
 * @param {Array<String>} options script options
 * @param {any} socket socket listening the output of the artifact
 */
function runArtifact(name, image, script, options, socket) {
  return new Promise((resolve, reject) => {
    const result = {
      output: '',
      error: '',
    };

    // get the corresponding artifact command to be executed
    const artifact = spawn('docker', [
      'run',
      '--rm',
      image,
      script,
      ...options,
    ]);

    // accumulate artifact output
    artifact.stdout.setEncoding('utf-8');
    artifact.stdout.on('data', (stdout) => {
      // @ts-ignore
      result.output += stripAnsi(stdout.toString());
      socket.emit('artifact_output', name, 'stdout', result.output);
    });

    // accumulate artifact error output
    artifact.stderr.setEncoding('utf-8');
    artifact.stderr.on('data', (stderr) => {
      // @ts-ignore
      result.error += stripAnsi(stderr.toString());
      socket.emit('artifact_output', name, 'error', result.error);
    });

    // catch error
    artifact.on('error', (error) => reject(error));

    // return result when the artifact finishes
    artifact.on('exit', async (code) => {
      if (code !== 0) {
        socket.emit('artifact_output', name, 'error', result.error);
        return reject(result.error);
      }

      socket.emit('artifact_exit');
    });

    resolve({
      pid: artifact.pid,
    });
  });
}

module.exports = { runArtifact };
