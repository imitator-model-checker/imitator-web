import { runArtifact, runImitator, stopArtifact, stopImitator } from './runner_api.js';
import {
  enableRunButton,
  hideSpinner,
  renderArtifactOutput,
  renderOutput,
  resetRunningState,
  startRunningState,
} from './utils.js';

/**
 * Form controller for the Imitator and artifact runner pages.
 *
 * This module wires submit handlers, benchmark toggles, and artifact/script
 * selectors. Rendering and HTTP transport stay in their own modules.
 */

/**
 * Clears the value of text, file, and select controls.
 *
 * @param {HTMLInputElement | HTMLSelectElement | null} field Field to reset.
 */
function clearFieldValue(field) {
  if (!field) return;

  if (field instanceof HTMLSelectElement && field.multiple) {
    Array.from(field.options).forEach((option) => {
      option.selected = false;
    });
    return;
  }

  field.value = '';
}

/**
 * Switches one file input/select pair between upload mode and benchmark mode.
 *
 * @param {HTMLInputElement} toggle Checkbox deciding which source is active.
 * @param {HTMLInputElement} fileInput File input used for local uploads.
 * @param {HTMLSelectElement} benchmarkSelect Select used for benchmark files.
 */
function setBenchmarkSource(toggle, fileInput, benchmarkSelect) {
  const useBenchmark = toggle.checked;

  clearFieldValue(fileInput);
  clearFieldValue(benchmarkSelect);

  fileInput.disabled = useBenchmark;
  benchmarkSelect.disabled = !useBenchmark;
  fileInput.classList.toggle('hidden', useBenchmark);
  benchmarkSelect.classList.toggle('hidden', !useBenchmark);
}

/**
 * Binds a benchmark toggle if its controls exist on the current page.
 *
 * @param {string} toggleSelector Checkbox selector.
 * @param {string} inputSelector File input selector.
 * @param {string} selectSelector Benchmark select selector.
 */
function initializeBenchmarkToggle(toggleSelector, inputSelector, selectSelector) {
  const toggle = document.querySelector(toggleSelector);
  const fileInput = document.querySelector(inputSelector);
  const benchmarkSelect = document.querySelector(selectSelector);

  if (!toggle || !fileInput || !benchmarkSelect) return;

  toggle.addEventListener('change', () => setBenchmarkSource(toggle, fileInput, benchmarkSelect));
  setBenchmarkSource(toggle, fileInput, benchmarkSelect);
}

/**
 * Keeps the artifact script select in sync with the selected artifact image.
 */
function initializeArtifactMenu() {
  const form = document.getElementById('artifact-form');
  const artifactSelect = document.getElementById('artifact');
  const scriptSelect = document.getElementById('script');
  const runButton = form?.querySelector('button[type="submit"]');

  if (!form || !artifactSelect || !scriptSelect || !runButton) return;

  const scriptOptions = Array.from(scriptSelect.options);

  function syncScriptOptions() {
    const selectedArtifact = artifactSelect.value;
    const disabled = selectedArtifact === 'none';

    scriptOptions.forEach((option, index) => {
      option.hidden = disabled ? index > 0 : !option.classList.contains(selectedArtifact);
    });

    const firstVisibleOption = scriptOptions.find((option) => !option.hidden);
    if (firstVisibleOption) scriptSelect.value = firstVisibleOption.value;

    scriptSelect.disabled = disabled;
    runButton.disabled = disabled;
  }

  artifactSelect.addEventListener('change', syncScriptOptions);
  syncScriptOptions();
}

/**
 * Handles the Imitator form submission and wires the stop button for its pids.
 */
function initializeImitatorForm() {
  const form = document.getElementById('imitator-form');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      startRunningState();

      const imitatorOutput = await runImitator(new FormData(form));
      const output = imitatorOutput.result;
      const identifiers = output.outputs.map((item) => item.pid);

      renderOutput(output, async () => {
        await stopImitator(identifiers);
        resetRunningState();
      });

      hideSpinner();
    } catch (error) {
      enableRunButton();
      hideSpinner();
      console.error('submit error: ', error);
    }
  });
}

/**
 * Handles the artifact form submission and wires the stop button for its run.
 */
function initializeArtifactForm() {
  const form = document.getElementById('artifact-form');
  if (!form) return;

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    try {
      startRunningState();

      const parameters = new FormData(form);
      const artifactOutput = await runArtifact(JSON.stringify(Object.fromEntries(parameters)));
      const output = artifactOutput.result;

      renderArtifactOutput(output, async () => {
        await stopArtifact(output.identifier);
        resetRunningState();
      });
    } catch (error) {
      enableRunButton();
      hideSpinner();
      console.error('submit error: ', error);
    }
  });
}

/**
 * Initializes all form behavior supported by the current page.
 */
function initializeForms() {
  initializeArtifactMenu();
  initializeImitatorForm();
  initializeArtifactForm();
  initializeBenchmarkToggle('#benchmark-models-toggle', '#models.input', '#models.select');
  initializeBenchmarkToggle('#benchmark-properties-toggle', '#property.input', '#property.select');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeForms);
} else {
  initializeForms();
}
