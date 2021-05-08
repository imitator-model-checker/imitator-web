const fs = require('fs');
const path = require('path');
const stream = require('stream');
const stripAnsi = require('strip-ansi');
const { getBenchmarkModelPath } = require('./benchmark');

/**
 * Creates a folder if it does not exists
 *
 * @param {String} destination folder to be created
 *
 * @returns Promise
 */
async function createFolder(destination) {
  if (!fs.existsSync(destination)) {
    await fs.promises.mkdir(destination, { recursive: true });
  }
}

/**
 * Move files to a folder
 *
 * @param {String} destination new destination folder
 * @param {Array} files object containing group of files
 *
 * @returns Promise<Object>
 */
async function moveToFolder(destination, files) {
  await createFolder(destination);

  await Promise.all(
    files.map((f) =>
      fs.promises.rename(f.path, path.join(destination, f.originalname))
    )
  );

  return files.map((f) => path.join(destination, f.originalname));
}

/**
 * Flat an array
 *
 * @param {Array<any>} arr array to be flatten
 * @returns Array<any>
 */
const flatArray = (arr) => [].concat(...arr);

/**
 * Remove ANSI characters from a stream
 */
const createStripAnsiStream = () =>
  new stream.Transform({
    transform: (chunk, enconding, done) => {
      const result = stripAnsi(chunk.toString());
      done(null, result);
    },
  });

/**
 * Copy benchmark files to a folder
 *
 * @param {String} destination new destination folder
 * @param {Array} names array of benchmark to be copied
 *
 * @returns Promise<Object>
 */
async function copyBenchmarksToFolder(destination, benchmarks) {
  await createFolder(destination);

  const files = benchmarks.map((b) => getBenchmarkModelPath(b));
  await Promise.all(
    files.map((f) => {
      fs.promises.copyFile(f, path.join(destination, path.basename(f)));
    })
  );

  return files.map((f) => path.join(destination, path.basename(f)));
}

module.exports = {
  moveToFolder,
  createFolder,
  flatArray,
  createStripAnsiStream,
  copyBenchmarksToFolder,
};
