const fs = require('fs');
const path = require('path');

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

module.exports = { moveToFolder, createFolder };
