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
 * Send a job to imitator
 *
 * @param {Object} parameters request's body
 *
 */
async function runImitator(parameters) {
  const response = await fetch('/api/imitator/run', {
    method: 'POST',
    body: parameters,
  });
  const data = await response.json();

  return data;
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
 * Initialize the tabs
 */
function initializeTabs() {
  // @ts-ignore
  $('.tab-slider--trigger:first').addClass('active');
  // @ts-ignore
  $('.tab-slider--body').hide();
  // @ts-ignore
  $('.tab-slider--body:first').show();

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
}

/**
 * Clean all the outputs from the view
 */
function cleanOutput() {
  // @ts-ignore
  $('.model', '#output-models').remove();
  // @ts-ignore
  $('.property', '#output-property').remove();
  // @ts-ignore
  $('.option', '#output-options').remove();
  // @ts-ignore
  $('.file', '#output-files').remove();
  // @ts-ignore
  $('li', '.tab-slider--tabs').remove();
  // @ts-ignore
  $('.tab-slider--body', '.tab-slider--container').remove();
}

/**
 * Render the imitator output in the view
 *
 * @param {Object} output imitator outputs
 */
function renderOutput(output) {
  // @ts-ignore
  $('#output-card').removeClass('hidden');
  // @ts-ignore
  $('#imitator-form').parent().removeClass('col-span-2');

  cleanOutput();

  // render models
  for (const model of output.models) {
    // @ts-ignore
    $('#output-models').append(`<span class="model chip mr-1">${model}</span>`);
  }

  // render property
  // @ts-ignore
  $('#output-property').append(
    `<span class="property chip mr-1">${output.property}</span>`
  );

  // render options
  for (const option of output.options) {
    // @ts-ignore
    $('#output-options').append(
      `<span class="option chip mr-1">${option}</span>`
    );
  }

  // render generated files
  let generatedFiles = output.outputs.reduce(
    (acc, o) => acc.concat(...o.files),
    []
  );
  generatedFiles = [...new Set(generatedFiles)].sort();

  for (const file of generatedFiles) {
    // @ts-ignore
    $('#output-files').append(
      `<span onclick="downloadFile('${output.identifier}', ${file});" class="file chip cursor-pointer mr-1">${file}</span>`
    );
  }

  // render download button
  // @ts-ignore
  $('#download-button').attr(
    'onclick',
    `downloadFile('${output.identifier}', '${output.file}');`
  );

  // render outputs
  for (const [index, stdout] of output.outputs.entries()) {
    // tab names
    // @ts-ignore
    $('#output-stdout .tab-slider--tabs').append(
      `<li class="tab-slider--trigger chip-outlined cursor-pointer mx-1" rel=tabs-${index}> ${stdout.prefix}</li>`
    );

    // tab container
    // @ts-ignore
    $('#output-stdout .tab-slider--container').append(
      `<div id=tabs-${index} class="tab-slider--body"><pre class="code-block h-64">${stdout.stdout}</pre></div>`
    );
  }

  initializeTabs();
}

// @ts-ignore
$('document').ready(function () {
  // @ts-ignore
  $('#imitator-form').submit(async function (event) {
    try {
      event.preventDefault();

      showSpinner();
      const parameters = new FormData(document.querySelector('#imitator-form'));
      const imitatorOutput = await runImitator(parameters);

      renderOutput(imitatorOutput.result);
      hideSpinner();
    } catch (err) {
      console.log('submit error: ', err);
    }
  });
});
