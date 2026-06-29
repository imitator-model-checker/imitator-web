const fs = require('fs');
const archiver = require('archiver');

/**
 * Zip files
 *
 * @param {String} outputFilename Absolute output path
 * @param {Array<Object>} files files to be zipped
 *
 * @returns Promise<Object>
 */
function zipFiles(outputFilename, files) {
  return new Promise((resolve, reject) => {
    const archive = archiver('zip', {
      zlib: { level: 9 },
    });

    const output = fs.createWriteStream(outputFilename);

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
      }
    }
    archive.finalize();

    output.on('close', () => resolve(outputFilename));
    archive.on('error', (err) => reject(err));
  });
}

module.exports = { zipFiles };
