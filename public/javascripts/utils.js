/**
 * Download a file using the imitator API
 *
 * @param {string} file file to be download
 */
// eslint-disable-next-line no-unused-vars
async function downloadFile(file) {
  const api = '/api/imitator/download';

  const res = await fetch(api, {
    method: 'POST',
    body: JSON.stringify({ file }),
    headers: {
      'Content-type': 'application/json',
    },
  });

  const blob = await res.blob();

  // @ts-ignore
  // eslint-disable-next-line no-undef
  download(blob, file);
}
