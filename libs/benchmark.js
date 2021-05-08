const path = require('path');
const glob = require('fast-glob');
const { benchmarksFolder } = require('../config');

/**
 * Returns the models and properties of benchmarks found in a folder
 *
 * @returns Object<any>
 */
async function getBenchmarkFiles() {
  const files = await glob('**/*.{imi,imiprop}', {
    deep: 2,
    onlyFiles: true,
    cwd: benchmarksFolder,
    followSymbolicLinks: false,
  });

  const filesByModel = files.reduce(
    (acc, file) => {
      const { dir, ext, name } = path.parse(file);
      const section = ext === '.imi' ? 'models' : 'properties';
      if (dir === '') return acc; // skip files in root folder

      dir in acc[section]
        ? acc[section][dir].push(name)
        : (acc[section][dir] = [name]);
      return acc;
    },
    { models: {}, properties: {} }
  );

  return filesByModel;
}

/**
 * Return the absolute path of a benchmark file
 * @param {String} name benchmark of the form <folder>/<benchmark name>
 *
 * @returns String
 */
function getBenchmarkModelPath(name) {
  const filePath = path.join(benchmarksFolder, `${name}.imi`);
  return filePath;
}

module.exports = {
  getBenchmarkFiles,
  getBenchmarkModelPath,
};
