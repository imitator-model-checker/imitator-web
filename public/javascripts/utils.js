/* eslint no-undef: 0 */
/* eslint no-unused-vars: 0 */

/**
 * Download a file using the imitator API
 *
 * @param {string} file file to be download
 */
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
  download(blob, file);
}

/**
 * Show spinner
 */
function showSpinner() {
  $('#spinner').addClass('loading');
}

/**
 * Hide spinner
 */
function hideSpinner() {
  $('#spinner').removeClass('loading');
}

/**
 *  Remove spinner when the form submission finishes
 */
window.onbeforeunload = function (e) {};
