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
 * Enable run button
 */
function enableRunButton() {
  // @ts-ignore
  $('#run-artifact-button').prop('disabled', false);
}

/**
 * Disable run button
 */
function disableRunButton() {
  // @ts-ignore
  $('#run-artifact-button').prop('disabled', true);
}

/**
 * Hide stop button
 */
function hideStopButton() {
  // @ts-ignore
  $('#stop-artifact-button').hide();
}

/**
 * Show stop button
 */
function showStopButton() {
  // @ts-ignore
  $('#stop-artifact-button').show();
}

/**
 * Stop a job  running an artifact
 *
 * @param {String} identifier job identifier
 */
async function stopArtifact(identifier) {
  const api = '/api/artifact/stop';

  const res = await fetch(api, {
    method: 'POST',
    body: JSON.stringify({ identifier }),
    headers: {
      'Content-type': 'application/json',
    },
  });

  hideSpinner();
  hideStopButton();
  enableRunButton();
}

/**
 * Stop an imitator job  running
 *
 * @param {String} identifiers job identifiers in a string separated by -
 */
async function stopImitator(identifiers) {
  const api = '/api/imitator/stop';
  const pids = identifiers.split('-');

  const res = await fetch(api, {
    method: 'POST',
    body: JSON.stringify({ identifiers: pids }),
    headers: {
      'Content-type': 'application/json',
    },
  });

  hideSpinner();
  hideStopButton();
  enableRunButton();
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
 * Send a job to artifact runner
 *
 * @param {Object} parameters request's body
 */
async function runArtifact(parameters) {
  const response = await fetch('/api/artifact/run', {
    method: 'POST',
    body: parameters,
    headers: {
      'Content-Type': 'application/json',
    },
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

  showStopButton();
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
      `<div id=tabs-${index} class="tab-slider--body"><pre id="stdout-${stdout.prefix}" class="code-block h-64"></pre></div>`
    );
  }

  initializeTabs();

  const pids = output.outputs.map((o) => o.pid).join('-');
  // render stop button
  // @ts-ignore
  $('#stop-artifact-button').attr('onclick', `stopImitator('${pids}');`);

  // // render download button
  // // @ts-ignore
  // $('#download-button').attr(
  //   'onclick',
  //   `downloadFile('${output.identifier}', '${output.file}');`
  // );
}

/**
 * Clean all the outputs from the view
 */
function cleanArtifactOutput() {
  // @ts-ignore
  $('#artifact-stdout').text('');
  // @ts-ignore
  $('.file', '#artifact-output-files').remove();
  showStopButton();
}

/**
 * Render the artifact output in the view
 *
 * @param {Object} output artifact output
 */
function renderArtifactOutput(output) {
  // @ts-ignore
  $('#artifact-output-card').removeClass('hidden');
  // @ts-ignore
  $('#artifact-form').parent().removeClass('col-span-2');

  cleanArtifactOutput();

  // render stop button
  // @ts-ignore
  $('#stop-artifact-button').attr(
    'onclick',
    `stopArtifact('${output.identifier}');`
  );
}

/**
 * Render the artifact menu
 */
function initializeArtifactMenu() {
  // @ts-ignore
  $('#script').children('option:gt(0)').hide();
  // @ts-ignore
  $('#artifact-form button').prop('disabled', true);

  // @ts-ignore
  $('#artifact').change(function () {
    // @ts-ignore
    const selected = $(this).val();
    const disable = selected === 'none';

    // @ts-ignore
    $('#script').children('option').hide();

    // @ts-ignore
    $('#script')
      .children('option[class^=' + selected + ']')
      .show();

    // @ts-ignore
    $('#script option:visible:first').prop('selected', true);

    // @ts-ignore
    $('#script').prop('disabled', disable);
    // @ts-ignore
    $('#artifact-form button').prop('disabled', disable);
  });
}

// @ts-ignore
$('document').ready(function () {
  initializeArtifactMenu();

  // @ts-ignore
  $('#imitator-form').submit(async function (event) {
    try {
      event.preventDefault();

      showSpinner();
      disableRunButton();

      const parameters = new FormData(document.querySelector('#imitator-form'));
      const imitatorOutput = await runImitator(parameters);

      renderOutput(imitatorOutput.result);
      hideSpinner();
    } catch (err) {
      enableRunButton();
      hideSpinner();
      console.log('submit error: ', err);
    }
  });

  // @ts-ignore
  $('#artifact-form').submit(async function (event) {
    try {
      event.preventDefault();

      showSpinner();
      disableRunButton();

      const parameters = new FormData(document.querySelector('#artifact-form'));
      // @ts-ignore
      const json = JSON.stringify(Object.fromEntries(parameters));
      const artifactOutput = await runArtifact(json);

      renderArtifactOutput(artifactOutput.result);
    } catch (err) {
      enableRunButton();
      hideSpinner();
      console.log('submit error: ', err);
    }
  });
});
