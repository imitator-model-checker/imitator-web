/* eslint no-undef: 0 */
/* eslint no-unused-vars: 0 */

/**
 * Download a file using the imitator API
 *
 * @param {string} identifier identifier of the execution
 * @param {string} file file to be download
 */
async function downloadFile(identifier, file) {
  const api = '/api/imitator/download';

  const res = await fetch(api, {
    method: 'POST',
    body: JSON.stringify({ identifier, file }),
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
  // @ts-ignore
  $('#spinner').addClass('loading');
}

/**
 * Hide spinner
 */
function hideSpinner() {
  // @ts-ignore
  $('#spinner').removeClass('loading');
}

/**
 *  Remove spinner when the form submission finishes
 */
// @ts-ignore
window.onbeforeunload = function (e) {};

// @ts-ignore
$('document').ready(function () {
  // @ts-ignore
  $('.tab-slider--body').hide();

  // @ts-ignore
  $('.tab-slider--body:first').show();

  // @ts-ignore
  $('.tab-slider--trigger:first').addClass('active');

  // @ts-ignore
  $('.tab-slider--nav li').click(function () {
    // @ts-ignore
    $('.tab-slider--body').hide();

    // @ts-ignore
    const activeTab = $(this).attr('rel');

    // @ts-ignore
    $('#' + activeTab).fadeIn();

    // @ts-ignore
    $('.tab-slider--nav li').removeClass('active');

    // @ts-ignore
    $(this).addClass('active');
  });
});
