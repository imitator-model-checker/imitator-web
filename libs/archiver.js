const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');

/**
 * Zip files
 *
 * @param {String} outputFolder Absolute output path
 * @param {Array<Object>} files files to be zipped
 *
 * @returns Promise<Object>
 */
function zipFiles(outputFolder, files) {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    const filename = path.join(outputFolder, `${uuidv4()}.zip`);
    const output = fs.createWriteStream(filename);

    archive.pipe(output);
    for (const f of files) {
      switch (f.type) {
        case 'file':
          // @ts-ignore
          archive.file(f.path, { name: f.name });
          break;
        case 'string':
          // @ts-ignore
          archive.append(f.path, { name: f.name });
          break;
        case 'glob': {
          const cwd = path.dirname(f.pattern);
          const pattern = path.basename(f.pattern);
          archive.glob(pattern, { cwd });
          break;
        }
      }
    }
    archive.finalize();

    output.on('close', () => resolve(filename));
    archive.on('error', (err) => reject(err));
  });
}

module.exports = { zipFiles };
