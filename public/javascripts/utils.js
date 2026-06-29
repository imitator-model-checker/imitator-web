function find(selector, root = document) {
  return root.querySelector(selector);
}

function findAll(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

function setHidden(element, hidden) {
  if (element) element.classList.toggle('hidden', hidden);
}

function setDisabled(element, disabled) {
  if (element) element.disabled = disabled;
}

function appendChip(containerSelector, className, label) {
  const container = find(containerSelector);
  if (!container) return;

  const chip = document.createElement('span');
  chip.className = `${className} chip mr-1`;
  chip.textContent = label;
  container.append(chip);
}

function removeItems(containerSelector, itemSelector) {
  const container = find(containerSelector);
  if (!container) return;

  findAll(itemSelector, container).forEach((item) => item.remove());
}

let currentStopHandler = null;
let boundStopButton = null;

function bindStopButton() {
  const stopButton = find('#stop-artifact-button');
  if (!stopButton || stopButton === boundStopButton) return;

  boundStopButton = stopButton;
  stopButton.addEventListener('click', async () => {
    if (currentStopHandler) await currentStopHandler();
  });
}

function setStopHandler(handler) {
  currentStopHandler = handler;
  bindStopButton();
}

export function enableRunButton() {
  setDisabled(find('#run-artifact-button'), false);
}

export function disableRunButton() {
  setDisabled(find('#run-artifact-button'), true);
}

export function hideStopButton() {
  setHidden(find('#stop-artifact-button'), true);
}

export function showStopButton() {
  setHidden(find('#stop-artifact-button'), false);
}

export function showSpinner() {
  find('#spinner')?.classList.add('loading');
}

export function hideSpinner() {
  find('#spinner')?.classList.remove('loading');
}

export function startRunningState() {
  showSpinner();
  disableRunButton();
}

export function resetRunningState() {
  hideSpinner();
  hideStopButton();
  enableRunButton();
}

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

export function cleanOutput() {
  removeItems('#output-models', '.model');
  removeItems('#output-property', '.property');
  removeItems('#output-options', '.option');
  removeItems('#output-files', '.file');
  removeItems('.tab-slider--tabs', 'li');
  removeItems('.tab-slider--container', '.tab-slider--body');

  showStopButton();
}

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

export function cleanArtifactOutput() {
  const artifactStdout = find('#artifact-stdout');
  if (artifactStdout) artifactStdout.textContent = '';

  removeItems('#artifact-output-files', '.file');
  showStopButton();
}

export function renderArtifactOutput(output, onStop) {
  setHidden(find('#artifact-output-card'), false);
  find('#artifact-form')?.parentElement?.classList.remove('col-span-2');

  cleanArtifactOutput();
  setStopHandler(onStop);
}

export function updateModelOutput(model, message) {
  const output = document.getElementById(`stdout-${model}`);
  if (output) output.textContent = message;
}

export function appendArtifactOutput(message) {
  find('#artifact-stdout')?.append(document.createTextNode(message));
}

export function downloadUrl(identifier, file) {
  return `/api/imitator/download/${encodeURIComponent(identifier)}/${encodeURIComponent(file)}`;
}

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
