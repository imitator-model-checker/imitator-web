/**
 * Shared DOM utilities and rendering helpers for the runner pages.
 *
 * The module intentionally avoids framework state and jQuery. It exposes small
 * operations used by form handlers and Transmit subscriptions.
 */

/**
 * Finds the first element matching a selector.
 *
 * @param {string} selector CSS selector to query.
 * @param {ParentNode} root Query root. Defaults to document.
 * @returns {Element | null}
 */
function find(selector, root = document) {
  return root.querySelector(selector);
}

/**
 * Finds all elements matching a selector.
 *
 * @param {string} selector CSS selector to query.
 * @param {ParentNode} root Query root. Defaults to document.
 * @returns {Element[]}
 */
function findAll(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

/**
 * Toggles Tailwind's hidden utility on an element.
 *
 * @param {Element | null} element Element to update.
 * @param {boolean} hidden Whether the element should be hidden.
 */
function setHidden(element, hidden) {
  if (element) element.classList.toggle('hidden', hidden);
}

/**
 * Toggles disabled state on form controls.
 *
 * @param {HTMLButtonElement | HTMLInputElement | HTMLSelectElement | null} element Control to update.
 * @param {boolean} disabled Whether the control should be disabled.
 */
function setDisabled(element, disabled) {
  if (element) element.disabled = disabled;
}

/**
 * Appends a labeled chip to a result summary container.
 *
 * @param {string} containerSelector Container selector.
 * @param {string} className Extra class identifying the chip type.
 * @param {string} label Chip text.
 */
function appendChip(containerSelector, className, label) {
  if (!label) return;

  const container = find(containerSelector);
  if (!container) return;

  const chip = document.createElement('span');
  chip.className = `${className} chip mr-1`;
  chip.textContent = label;
  container.append(chip);
}

/**
 * Removes matching generated children from a container.
 *
 * @param {string} containerSelector Container selector.
 * @param {string} itemSelector Generated item selector.
 */
function removeItems(containerSelector, itemSelector) {
  const container = find(containerSelector);
  if (!container) return;

  findAll(itemSelector, container).forEach((item) => item.remove());
}

let currentStopHandler = null;
let boundStopButton = null;

/**
 * Binds the shared stop button once and delegates to the latest stop handler.
 */
function bindStopButton() {
  const stopButton = find('#stop-artifact-button');
  if (!stopButton || stopButton === boundStopButton) return;

  boundStopButton = stopButton;
  stopButton.addEventListener('click', async () => {
    if (currentStopHandler) await currentStopHandler();
  });
}

/**
 * Replaces the stop button behavior for the currently displayed run.
 *
 * @param {() => Promise<void>} handler Stop action for the active run.
 */
function setStopHandler(handler) {
  currentStopHandler = handler;
  bindStopButton();
}

/**
 * Enables the run button.
 */
export function enableRunButton() {
  setDisabled(find('#run-artifact-button'), false);
}

/**
 * Disables the run button.
 */
export function disableRunButton() {
  setDisabled(find('#run-artifact-button'), true);
}

/**
 * Hides the shared stop button.
 */
export function hideStopButton() {
  setHidden(find('#stop-artifact-button'), true);
}

/**
 * Shows the shared stop button.
 */
export function showStopButton() {
  setHidden(find('#stop-artifact-button'), false);
}

/**
 * Shows the global loading indicator.
 */
export function showSpinner() {
  find('#spinner')?.classList.add('loading');
}

/**
 * Hides the global loading indicator.
 */
export function hideSpinner() {
  find('#spinner')?.classList.remove('loading');
}

/**
 * Applies the running state before a job request is sent.
 */
export function startRunningState() {
  showSpinner();
  disableRunButton();
}

/**
 * Restores the idle state after a run exits or is stopped.
 */
export function resetRunningState() {
  hideSpinner();
  hideStopButton();
  enableRunButton();
}

/**
 * Initializes stdout tab switching for generated Imitator output panes.
 */
export function initializeTabs() {
  const triggers = findAll('.tab-slider--trigger');
  const bodies = findAll('.tab-slider--body');

  function activateTab(trigger) {
    triggers.forEach((item) => item.classList.remove('active'));
    bodies.forEach((body) => setHidden(body, true));

    trigger.classList.add('active');
    setHidden(find(`#${trigger.dataset.tabTarget}`), false);
  }

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => activateTab(trigger));
  });

  if (triggers[0]) activateTab(triggers[0]);
}

/**
 * Clears generated Imitator output and reveals the stop button.
 */
export function cleanOutput() {
  removeItems('#output-models', '.model');
  removeItems('#output-property', '.property');
  removeItems('#output-options', '.option');
  removeItems('#output-files', '.file');
  removeItems('.tab-slider--tabs', 'li');
  removeItems('.tab-slider--container', '.tab-slider--body');

  showStopButton();
}

/**
 * Renders the initial Imitator output shell returned by the run endpoint.
 *
 * @param {object} output Run metadata including models, options, and stdout panes.
 * @param {() => Promise<void>} onStop Stop action for the active run.
 */
export function renderOutput(output, onStop) {
  setHidden(find('#output-card'), false);
  find('#imitator-form')?.parentElement?.classList.remove('col-span-2');

  cleanOutput();

  for (const model of output.models ?? []) {
    appendChip('#output-models', 'model', model);
  }

  appendChip('#output-property', 'property', output.property);

  for (const option of output.options ?? []) {
    appendChip('#output-options', 'option', option);
  }

  const tabList = find('#output-stdout .tab-slider--tabs');
  const tabContainer = find('#output-stdout .tab-slider--container');

  for (const [index, stdout] of (output.outputs ?? []).entries()) {
    const tabId = `tabs-${index}`;

    const trigger = document.createElement('li');
    trigger.className = 'tab-slider--trigger chip-outlined cursor-pointer mx-1';
    trigger.dataset.tabTarget = tabId;
    trigger.textContent = stdout.prefix;
    tabList?.append(trigger);

    const body = document.createElement('div');
    body.id = tabId;
    body.className = 'tab-slider--body hidden';

    const pre = document.createElement('pre');
    pre.id = `stdout-${stdout.prefix}`;
    pre.className = 'code-block h-64';
    body.append(pre);

    tabContainer?.append(body);
  }

  initializeTabs();
  setStopHandler(onStop);
}

/**
 * Clears generated artifact output and reveals the stop button.
 */
export function cleanArtifactOutput() {
  const artifactStdout = find('#artifact-stdout');
  if (artifactStdout) artifactStdout.textContent = '';

  removeItems('#artifact-output-files', '.file');
  showStopButton();
}

/**
 * Renders the initial artifact output shell returned by the run endpoint.
 *
 * @param {object} output Run metadata including the workspace identifier.
 * @param {() => Promise<void>} onStop Stop action for the active run.
 */
export function renderArtifactOutput(output, onStop) {
  setHidden(find('#artifact-output-card'), false);
  find('#artifact-form')?.parentElement?.classList.remove('col-span-2');

  cleanArtifactOutput();
  setStopHandler(onStop);
}

/**
 * Replaces the text content for one Imitator stdout pane.
 *
 * @param {string} model Output pane identifier.
 * @param {string} message Latest streamed output.
 */
export function updateModelOutput(model, message) {
  const output = document.getElementById(`stdout-${model}`);
  if (output) output.textContent = message;
}

/**
 * Appends streamed artifact output to the artifact terminal.
 *
 * @param {string} message Output chunk received from Transmit.
 */
export function appendArtifactOutput(message) {
  find('#artifact-stdout')?.append(document.createTextNode(message));
}

/**
 * Builds the public download URL for a generated file.
 *
 * @param {string} identifier Workspace identifier.
 * @param {string} file Generated filename.
 * @returns {string}
 */
export function downloadUrl(identifier, file) {
  return `/api/imitator/download/${encodeURIComponent(identifier)}/${encodeURIComponent(file)}`;
}

/**
 * Appends a generated-file download link that opens without losing page state.
 *
 * @param {string} containerSelector Container selector.
 * @param {string} identifier Workspace identifier.
 * @param {string} file Generated filename.
 */
export function appendDownloadLink(containerSelector, identifier, file) {
  const container = find(containerSelector);
  if (!container) return;

  const link = document.createElement('a');
  link.href = downloadUrl(identifier, file);
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.className = 'file chip cursor-pointer mr-1 mb-1';
  link.textContent = file;

  container.append(link);
}
