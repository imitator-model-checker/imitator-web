import { runArtifact, runImitator, stopArtifact, stopImitator } from './runner_api.js';
import {
  enableRunButton,
  hideSpinner,
  renderArtifactOutput,
  renderOutput,
  resetRunningState,
  startRunningState,
} from './utils.js';

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

function setBenchmarkSource(toggle, fileInput, benchmarkSelect) {
  const useBenchmark = toggle.checked;

  clearFieldValue(fileInput);
  clearFieldValue(benchmarkSelect);

  fileInput.disabled = useBenchmark;
  benchmarkSelect.disabled = !useBenchmark;
  fileInput.classList.toggle('hidden', useBenchmark);
  benchmarkSelect.classList.toggle('hidden', !useBenchmark);
}

function initializeBenchmarkToggle(toggleSelector, inputSelector, selectSelector) {
  const toggle = document.querySelector(toggleSelector);
  const fileInput = document.querySelector(inputSelector);
  const benchmarkSelect = document.querySelector(selectSelector);

  if (!toggle || !fileInput || !benchmarkSelect) return;

  toggle.addEventListener('change', () => setBenchmarkSource(toggle, fileInput, benchmarkSelect));
  setBenchmarkSource(toggle, fileInput, benchmarkSelect);
}

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
